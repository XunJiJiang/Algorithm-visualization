type AllType = string | number | boolean | null | undefined | ObjType;

type ObjType =
  | AllType[]
  | {
      [key: string]: AllType;
    };

const deepClone = <T extends AllType>(obj: T): T => {
  const map = new WeakMap();

  function _deepCopy(_obj: AllType): AllType {
    if (typeof _obj !== 'object' || _obj === null) return _obj;
    if (map.has(_obj)) return map.get(_obj);

    const result = Array.isArray(_obj)
      ? ([] as AllType[])
      : ({} as {
          [key: string]: AllType;
        });

    map.set(_obj, result);

    if (Array.isArray(result) && Array.isArray(_obj)) {
      for (let i = 0; i < _obj.length; i++) {
        result[i] = _deepCopy(_obj[i]);
      }
    } else {
      for (const key in _obj) {
        if (Object.prototype.hasOwnProperty.call(_obj, key)) {
          // @ts-ignore
          result[key] = _deepCopy(_obj[key]);
        }
      }
    }

    return result;
  }

  return _deepCopy(obj) as T;
};

export { deepClone };
