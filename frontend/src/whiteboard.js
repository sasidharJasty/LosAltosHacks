import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { LiveMap } from "@liveblocks/client";
import { RoomProvider } from "./liveblocks.config";

const client = createClient({
  publicApiKey: "pk_prod_QQMg1BsV7YcPtxgQWM87_fFUoppbuomjHTORM582KyS7q22j1c3EBxZjb8bFFKko",
});
//force push
ReactDOM.render(
  <React.StrictMode>
    <RoomProvider
      id="react-whiteboard-app"
      initialStorage={{
        shapes: new LiveMap(),
      }}
    >
      <App />
    </RoomProvider>
  </React.StrictMode>,
  document.getElementById("root")
);