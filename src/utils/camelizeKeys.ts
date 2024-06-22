const snakeCaseRegex = /[-_](\w)/g;

export const camelizeKeys = (obj: any): any => {
  if (typeof obj !== "object" || obj == null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => camelizeKeys(item));
  }

  const newObj: { [key: string]: any } = {};

  for (const [key, value] of Object.entries(obj)) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelCaseKey = key.replace(snakeCaseRegex, (_, letter) => letter.toUpperCase());
      newObj[camelCaseKey] = camelizeKeys(value);
    }
  }

  return Object.keys(newObj).length > 0 ? newObj : obj;
};
