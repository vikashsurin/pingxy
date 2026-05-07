import CreateGroupDialog from "./CreateGroupDialog";
export default function GroupPageHeader() {

  return (
    <div className="flex gap-6 items-start ">
      <div>
        <h4 className="text-sm font-medium">Collaboration Hub</h4>
        <h2 className="text-xl font-bold"> Discover Groups</h2>
        <p className="text-sm">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum
          assumenda molestias quod! Corporis itaque sed dignissimos nemo, totam
          modi dolorem illum dolores neque sunt harum distinctio asperiores
          laboriosam voluptate eveniet!
        </p>
      </div>

      <CreateGroupDialog />
    </div>
  );
}
