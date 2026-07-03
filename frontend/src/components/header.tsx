interface HeaderProps {
  careerTotal: number;
  teamTotal: number;
}

export const Header = ({ careerTotal, teamTotal }: HeaderProps) => {
  return (
    <div className="flex justify-between items-center w-full mb-2 lg:mb-0">
      <h1 className="w-50 md:w-auto text-4xl mb-4">
        NBA Stats Finder <span>🏀</span>
      </h1>
      <div className="flex flex-col md:flex-row gap-2">
        <div className="bg-blue-900 text-white px-2 py-1 md:px-4 md:py-4 rounded-lg shadow-lg">
          <p className="text-[10px] md:text-xs uppercase font-bold">
            Career Total
          </p>
          <p className="text-sm md:text-3xl font-mono">
            {careerTotal.toLocaleString()}{" "}
            <span className="text-[10px] md:text-sm">PTS</span>
          </p>
        </div>
        <div className="bg-blue-700 text-white px-2 py-1 md:px-4 md:py-4 rounded-lg shadow-lg">
          <p className="text-[10px] md:text-xs uppercase font-bold">
            Team Total
          </p>
          <p className="text-sm md:text-3xl font-mono">
            {teamTotal.toLocaleString()}{" "}
            <span className="text-[10px] md:text-sm">PTS</span>
          </p>
        </div>
      </div>
    </div>
  );
};
