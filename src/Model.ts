export class Model {
  id!: string;
  _type!: string;

  toJSON(maxDepth = 100): any {
    const response: any = { ...this };
    delete response._type;

    for (const key in response) {
      if (response[key] instanceof Model) {
        if (maxDepth <= 0) {
          delete response[key]
        } else {
          response[key] = response[key].toJSON(maxDepth - 1);
        }
      }
    }
    return response;
  }

  toFormData() {
    const data = this.toJSON();
    const formData = new FormData();
    for (const key in data) {
      if (data[key] === null || data[key] === undefined) {
        continue;
      }
      if (Array.isArray(data[key])) {
        for (const value of data[key]) {
          formData.append(key + "[]", value);
        }
      } else if (data[key] instanceof File) {
        formData.append(key, data[key], data[key].filename);
      } else {
        formData.append(key, data[key]);
      }
    }
    return formData;
  }
}
