import Loading from "@/src/components/Loading";
import { useFetchParticipants } from "@/src/hooks";
import { Participant } from "@pingxy/shared";

export default function Members({ id }: { id: string }) {
  const { data, isLoading } = useFetchParticipants(parseInt(id));


  return (
    <div className=" bg-gray-100   border-gray-300">
      <h2 className="px-3 bg-white py-2 font-bold">
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
    <li className=" text-sm py-2  px-3">
      <span>{name}</span>
    </li>
  );
}
