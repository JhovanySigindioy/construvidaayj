import { useState } from "react";

type MonthYearSelectorProps = {
  onChange: (month: number, year: number) => void;
};

export default function MonthYearSelector({ onChange }: MonthYearSelectorProps) {
  const [month, setMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    setMonth(newMonth);
    onChange(newMonth, year);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    setYear(newYear);
    onChange(month, newYear);
  };

  return (
    <div className="flex justify-center sm:justify-start gap-2 w-full sm:w-auto">
      <select
        className="
          w-full
          sm:w-auto
          border border-gray-300 rounded-md px-2 py-1.5
          shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition duration-150 ease-in-out bg-white hover:border-gray-400
          text-sm
          sm:text-base
        "
        value={month}
        onChange={handleMonthChange}
      >
        {months.map((m, idx) => (
          <option key={idx} value={idx}>{m}</option>
        ))}
      </select>

      <select
        className="
          w-full
          sm:w-auto
          border border-gray-300 rounded-md px-2 py-1.5
          shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition duration-150 ease-in-out bg-white hover:border-gray-400
          text-sm
          sm:text-base
        "
        value={year}
        onChange={handleYearChange}
      >
        {Array.from({ length: 10 }, (_, i) => {
          const currentYear = new Date().getFullYear();
          const y = currentYear - 5 + i; 
          return <option key={y} value={y}>{y}</option>;
        })}
      </select>
    </div>
  );
}