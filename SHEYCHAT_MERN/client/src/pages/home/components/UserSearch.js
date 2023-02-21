import React from "react";
import { RiSearchLine } from "react-icons/ri";

function UserSearch({ searchKey, setSearchKey }) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search users / chats"
        className="rounded-xl w-full border-gray-300 pl-12 text-gray-500 h-12"
        value={searchKey}
        onChange={(e) => setSearchKey(e.target.value)}
      />
      <RiSearchLine className="absolute top-4 left-4 text-gray-500" />
    </div>
  );
}

export default UserSearch;
