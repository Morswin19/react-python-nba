export const Header = ({ totalScore }: { totalScore: number }) => {
  return (
    <div className="flex justify-between items-center w-full">
      <h1 className="text-4xl mb-4">
        NBA Stats Finder <span>🏀</span>
      </h1>
      <div className="bg-blue-900 text-white p-4 rounded-lg shadow-lg">
        <p className="text-xs uppercase font-bold">Your Total Score</p>
        <p className="text-3xl font-mono">
          {totalScore.toLocaleString()} <span className="text-sm">PTS</span>
        </p>
      </div>
    </div>
  );
};
