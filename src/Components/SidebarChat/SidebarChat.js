import React from "react";
import "./SidebarChat.css";
import Avatar from "@material-ui/core/Avatar";
const SidebarChat = () => {
  return (
    <div className="sidebarChat">
      <Avatar />
      <div className="sidebarChat__info">
        <h2>Vishal</h2>
        <p>Hey what time are you leaving ?</p>
      </div>
    </div>
  );
};

export default SidebarChat;
