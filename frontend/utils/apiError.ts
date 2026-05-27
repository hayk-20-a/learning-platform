import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

interface ApiValidationError {
  field?: string;
  message?: string;
}

interface ApiErrorBody {
  message?: string;
  errors?: ApiValidationError[];
}

interface ApiErrorLike {
  message?: string;
  response?: {
    data?: ApiErrorBody;
  };
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
) {
  const apiError = error as ApiErrorLike;
  const data = apiError.response?.data;
  const validationMessage = data?.errors?.find((item) => item.message)?.message;

  return validationMessage || data?.message || apiError.message || fallback;
}

export function getApiFieldErrors(error: unknown) {
  const apiError = error as ApiErrorLike;
  const errors = apiError.response?.data?.errors;

  if (!Array.isArray(errors)) {
    return {};
  }

  return errors.reduce<Record<string, string>>((acc, item) => {
    if (item.field && item.message) {
      acc[item.field] = item.message;
    }

    return acc;
  }, {});
}

export function applyApiFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
) {
  const fieldErrors = getApiFieldErrors(error);

  Object.entries(fieldErrors).forEach(([field, message]) => {
    setError(field as Path<T>, { type: "server", message });
  });

  return fieldErrors;
}
