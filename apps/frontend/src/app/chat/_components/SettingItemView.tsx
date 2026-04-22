export default function SettingItemView({ selected }: { selected: string }) {
  return <div>{selected === "profile" && <Profile />}</div>;
}

function Profile() {
  return (
    <div className="p-4">
      <div className="flex flex-col">
        <span>Username :{}</span>
        <span>Age :{}</span>
        <span>Gender :{}</span>
        <span>Country :{}</span>
        <span>Bio :{}</span>
      </div>
    </div>
  );
}
