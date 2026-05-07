import Loading from "@/src/components/Loading";
import { useFetchParticipants } from "@/src/hooks";
import { Participant } from "@pingxy/shared";

export default function Members({ id }: { id: string }) {
  const { data, isLoading } = useFetchParticipants(parseInt(id));


  return (
    <div className="m-2 p-2 bg-gray-100 rounded-lg border border-gray-300">
      <h2 className="text-sm text-gray-400 px-2">
        {" "}
        {isLoading ? <Loading /> : "Members"}
      </h2>
      <ul>
        {data?.map((participant: Participant) => (
          <Member key={participant.id} name={participant.userName} />
        ))}
      </ul>
    </div>
  );
}

function Member({ name }: { name: string }) {
  return (
    <li className=" text-sm py-1  px-2">
      <span>{name}</span>
    </li>
  );
}
