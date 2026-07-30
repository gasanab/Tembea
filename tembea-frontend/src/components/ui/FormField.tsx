type FormFieldProps = {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
};

export function FormField({ 
  label, 
  placeholder, 
  type = "text", 
  value, 
  onChange,
  required = false 
}: FormFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-extrabold text-tembea-dark">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input 
        className="field-control" 
        placeholder={placeholder} 
        type={type}
        value={value}
        onChange={onChange}
        required={required}
      />
    </label>
  );
}
