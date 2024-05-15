class ProblemDetailsError extends Error {
  statusCode: number;
  detail: string;

  constructor(statusCode: number, detail: string) {
    super(detail);
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

export const createError = (statusCode: number, detail: string): ProblemDetailsError => {
  return new ProblemDetailsError(statusCode, detail);
};
