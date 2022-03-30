export class Model {
  id!: string;

  toJSON(): any {
    return { ...this };
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
