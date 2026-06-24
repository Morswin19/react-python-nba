interface HeaderProps {
  careerTotal: number;
  teamTotal: number;
}

export const Header = ({ careerTotal, teamTotal }: HeaderProps) => {
  return (
    <div className="flex justify-between items-center w-full">
      <h1 className="text-4xl mb-4">
        NBA Stats Finder <span>🏀</span>
      </h1>
      <div className="flex gap-2">
        <div className="bg-blue-900 text-white p-4 rounded-lg shadow-lg">
          <p className="text-xs uppercase font-bold">Career Total</p>
          <p className="text-3xl font-mono">
            {careerTotal.toLocaleString()} <span className="text-sm">PTS</span>
          </p>
        </div>
        <div className="bg-blue-700 text-white p-4 rounded-lg shadow-lg">
          <p className="text-xs uppercase font-bold">Team Total</p>
          <p className="text-3xl font-mono">
            {teamTotal.toLocaleString()} <span className="text-sm">PTS</span>
          </p>
        </div>
      </div>
    </div>
  );
};
