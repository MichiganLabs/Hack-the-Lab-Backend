export class ProblemDetailsError extends Error {
  statusCode: number;
  title: string;
  detail: string;
  additionalProperties: Record<string, any>;

  constructor(statusCode: number, title: string, detail: string, additionalProperties: Record<string, any>) {
    super(detail);
    this.statusCode = statusCode;
    this.title = title;
    this.detail = detail;
    this.additionalProperties = additionalProperties;
  }
}

export const createError = (
  statusCode: number,
  title: string,
  detail: string,
  additionalProperties: Record<string, any> = {},
): ProblemDetailsError => {
  return new ProblemDetailsError(statusCode, title, detail, additionalProperties);
};
