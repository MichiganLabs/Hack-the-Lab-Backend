import { Direction, Environment } from "@enums";

declare global {
  interface String {
    toPascalCase(): string;
  }
}

String.prototype.toPascalCase = function (): string {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

const throwError = (errorMessage: string) => {
  throw new Error(errorMessage);
};

export const convertToDirection = (value: string): Direction => {
  if (typeof value !== "string") throw new Error("Type 'Direction' must be a string!");

  const dir = Direction[value.toPascalCase() as keyof typeof Direction];
  return dir || throwError(`Invalid direction '${value}'`);
};

export const convertToEnvironment = (value: string): Environment => {
  if (typeof value !== "string") throw new Error("Type 'Environment' must be a string!");

  const env = Environment[value.toPascalCase() as keyof typeof Environment];
  return env || throwError(`Invalid environment '${value}'`);
};
