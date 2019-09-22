import lineTypes from '../constants/lineTypes';

export function formatLineType(key: string) {
  const t = lineTypes[key];
  const split = t.split('_');
  let name: string = '';
  for (let i = 0; i < split.length; i += 1) {
    const element = split[i];
    name += element;
    if (i !== split.length - 1) {
      name += ' ';
    }
  }
  return name;
};

export function formatLineTypes() {
  const newLineTypes = [];
  Object.keys(lineTypes).forEach(key => {
    const name = formatLineType(key);
    newLineTypes.push({ value: key, label: name });
  });
  return newLineTypes;
}

export function lineTypeToSelectOption(t: string) {
  const key = t.toUpperCase();
  return { value: key, label: formatLineType(key) };
}
