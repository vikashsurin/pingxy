export default function Messages({ id }: { id: number }) {
  return (
    <div className="h-full overflow-y-auto border ">
      <ul>
        <li>Message 1</li>
        <li>Message 2</li>
        <li>Message 3</li>
        <li>Message 4</li>
        <li>Message 5</li>
      </ul>
    </div>
  );
}
