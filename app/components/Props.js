export type Option = {
  value: string,
  label: string
};

export type SelectProps = {
  onChange: () => void,
  options: Array<Option>,
  value: Option
};
