import { Plus } from "lucide-react";
import { useState } from "react";
import CreateGroupDialog from "./CreateGroupDialog";

export default function GroupPageHeader() {
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);

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

      <button
        type="button"
        className="text-nowrap px-3 py-2 bg-blue-600 rounded text-white hover:bg-blue-500 transition-colors active:bg-blue-700 mt-auto"
        onClick={() => setIsCreateGroupDialogOpen(true)}
      >
        <Plus size={20} />
        Create Group
      </button>
      {isCreateGroupDialogOpen && (
        <CreateGroupDialog
          setIsCreateGroupDialogOpen={setIsCreateGroupDialogOpen}
        />
      )}
    </div>
  );
}
