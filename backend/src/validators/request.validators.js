const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_RE = /^[a-f0-9]{64}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const toTrimmedString = (value) =>
  typeof value === "string" ? value.trim() : value;

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const addError = (errors, field, message) => {
  errors.push({ field, message });
};

const validate = (build) => (req, res, next) => {
  const errors = [];
  build(req, errors);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

const requireBody = (req, errors) => {
  if (!isPlainObject(req.body)) {
    addError(errors, "body", "Request body must be a JSON object");
    return false;
  }
  return true;
};

const requireString = (
  source,
  errors,
  field,
  { min = 1, max = 255, label = field } = {},
) => {
  const value = toTrimmedString(source[field]);
  source[field] = value;

  if (typeof value !== "string" || value.length === 0) {
    addError(errors, field, `${label} is required`);
    return;
  }

  if (value.length < min) {
    addError(errors, field, `${label} must be at least ${min} characters`);
  }

  if (value.length > max) {
    addError(errors, field, `${label} must be at most ${max} characters`);
  }
};

const optionalString = (
  source,
  errors,
  field,
  { min = 1, max = 255, label = field } = {},
) => {
  if (source[field] === undefined || source[field] === null) return;
  requireString(source, errors, field, { min, max, label });
};

const requireEmail = (source, errors, field = "email") => {
  const value = toTrimmedString(source[field]);
  source[field] = typeof value === "string" ? value.toLowerCase() : value;

  if (typeof source[field] !== "string" || !EMAIL_RE.test(source[field])) {
    addError(errors, field, "Valid email is required");
  }
};

const requireUuid = (source, errors, field, label = field) => {
  const value = toTrimmedString(source[field]);
  source[field] = value;

  if (typeof value !== "string" || !UUID_RE.test(value)) {
    addError(errors, field, `${label} must be a valid id`);
  }
};

const optionalBoolean = (source, errors, field) => {
  const value = source[field];
  if (value === undefined || value === null) return;

  if (typeof value === "boolean") return;
  if (value === "true") {
    source[field] = true;
    return;
  }
  if (value === "false") {
    source[field] = false;
    return;
  }

  addError(errors, field, `${field} must be true or false`);
};

const optionalPrice = (source, errors, field = "price") => {
  const value = source[field];
  if (value === undefined || value === null || value === "") {
    source[field] = 0;
    return;
  }

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    addError(errors, field, "Price must be a non-negative number");
    return;
  }

  if (numberValue > 10000) {
    addError(errors, field, "Price must be 10000 or less");
    return;
  }

  source[field] = numberValue;
};

const optionalUrl = (source, errors, field) => {
  const value = toTrimmedString(source[field]);
  if (value === undefined || value === null || value === "") {
    delete source[field];
    return;
  }

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      addError(errors, field, `${field} must be an http or https URL`);
      return;
    }
    source[field] = value;
  } catch {
    addError(errors, field, `${field} must be a valid URL`);
  }
};

const validatePaginationQuery = validate((req, errors) => {
  const { query } = req;
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 12 : Number(query.limit);

  if (!Number.isInteger(page) || page < 1) {
    addError(errors, "page", "Page must be a positive integer");
  } else {
    query.page = page;
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    addError(errors, "limit", "Limit must be an integer between 1 and 50");
  } else {
    query.limit = limit;
  }

  optionalString(query, errors, "search", { min: 1, max: 120 });
  if (query.category !== undefined) {
    query.category = toTrimmedString(query.category);
    if (typeof query.category !== "string" || !SLUG_RE.test(query.category)) {
      addError(errors, "category", "Category must be a valid slug");
    }
  }
});

const validateSlugParam = validate((req, errors) => {
  const { slug } = req.params;
  if (typeof slug !== "string" || !SLUG_RE.test(slug)) {
    addError(errors, "slug", "Slug must be valid");
  }
});

const validateTokenQuery = validate((req, errors) => {
  const token = toTrimmedString(req.query.token);
  req.query.token = token;
  if (typeof token !== "string" || !TOKEN_RE.test(token)) {
    addError(errors, "token", "Token is invalid");
  }
});

const validateIdParam = (paramName = "id") =>
  validate((req, errors) => {
    requireUuid(req.params, errors, paramName, paramName);
  });

const validateRegister = validate((req, errors) => {
  if (!requireBody(req, errors)) return;
  requireString(req.body, errors, "name", { min: 2, max: 80, label: "Name" });
  requireEmail(req.body, errors);
  requireString(req.body, errors, "password", {
    min: 6,
    max: 128,
    label: "Password",
  });

  if (req.body.role !== undefined) {
    const role = toTrimmedString(req.body.role).toUpperCase();
    if (!["STUDENT", "TEACHER"].includes(role)) {
      addError(errors, "role", "Role must be student or teacher");
    } else {
      req.body.role = role;
    }
  }
});

const validateLogin = validate((req, errors) => {
  if (!requireBody(req, errors)) return;
  requireEmail(req.body, errors);
  requireString(req.body, errors, "password", {
    min: 1,
    max: 128,
    label: "Password",
  });
});

const validateForgotPassword = validate((req, errors) => {
  if (!requireBody(req, errors)) return;
  requireEmail(req.body, errors);
});

const validateResetPassword = validate((req, errors) => {
  if (!requireBody(req, errors)) return;
  const token = toTrimmedString(req.body.token);
  req.body.token = token;
  if (typeof token !== "string" || !TOKEN_RE.test(token)) {
    addError(errors, "token", "Token is invalid");
  }
  requireString(req.body, errors, "password", {
    min: 6,
    max: 128,
    label: "Password",
  });
});

const validateCreateCourse = validate((req, errors) => {
  if (!requireBody(req, errors)) return;
  requireString(req.body, errors, "title", {
    min: 3,
    max: 120,
    label: "Course title",
  });
  requireString(req.body, errors, "description", {
    min: 10,
    max: 5000,
    label: "Description",
  });
  requireUuid(req.body, errors, "categoryId", "Category");
  optionalPrice(req.body, errors);
});

const validateUpdateCourse = validate((req, errors) => {
  if (!requireBody(req, errors)) return;

  optionalString(req.body, errors, "title", {
    min: 3,
    max: 120,
    label: "Course title",
  });
  optionalString(req.body, errors, "description", {
    min: 10,
    max: 5000,
    label: "Description",
  });
  if (req.body.categoryId !== undefined) {
    requireUuid(req.body, errors, "categoryId", "Category");
  }
  if (req.body.price !== undefined) {
    optionalPrice(req.body, errors);
  }
  optionalBoolean(req.body, errors, "isPublished");
  optionalUrl(req.body, errors, "thumbnailUrl");

  const allowedFields = [
    "title",
    "description",
    "categoryId",
    "price",
    "isPublished",
    "thumbnailUrl",
  ];
  if (!allowedFields.some((field) => req.body[field] !== undefined)) {
    addError(errors, "body", "At least one course field is required");
  }
});

const validateSectionBody = validate((req, errors) => {
  if (!requireBody(req, errors)) return;
  requireString(req.body, errors, "title", {
    min: 2,
    max: 120,
    label: "Section title",
  });
});

const validateLessonBody = validate((req, errors) => {
  if (!requireBody(req, errors)) return;
  requireString(req.body, errors, "title", {
    min: 2,
    max: 120,
    label: "Lesson title",
  });
  optionalBoolean(req.body, errors, "isFreePreview");
});

const validateCourseIdBody = validate((req, errors) => {
  if (!requireBody(req, errors)) return;
  requireUuid(req.body, errors, "courseId", "Course");
});

const validateLessonIdBody = validate((req, errors) => {
  if (!requireBody(req, errors)) return;
  requireUuid(req.body, errors, "lessonId", "Lesson");
});

module.exports = {
  validatePaginationQuery,
  validateSlugParam,
  validateTokenQuery,
  validateIdParam,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateCreateCourse,
  validateUpdateCourse,
  validateSectionBody,
  validateLessonBody,
  validateCourseIdBody,
  validateLessonIdBody,
};
