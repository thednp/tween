import van from "vanjs-core";
import { App } from "./App";
import "./index.css";

van.add(document.getElementById("root") ?? document.body, App());
