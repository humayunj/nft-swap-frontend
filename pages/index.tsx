import { useAPI } from "@/hooks/useAPI";
import axios from "axios";

import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
enum State {
  Idle,
  Joining,
  Creating,
}

export default function Index() {
  const [state, setState] = useState<State>(State.Idle);
  const API = useAPI();
  const router = useRouter();
  const [sessionInput, setSessionInput] = useState("");

  const [showSessionInput, setShowSessionInput] = useState(false);

  const handleCreateSession = async () => {
    try {
      setState(State.Creating);
      const sessionId = await toast.promise(API.createSession(), {
        error: "Failed to create session. Try again.",
        loading: "Creating session",
        success: "Session created",
      });

      router.push("/trade?session=" + sessionId);
    } finally {
      setState(State.Idle);
    }
  };
  const handleJoinSession = async () => {
    try {
      const sId = sessionInput;

      setState(State.Joining);

      const session = await toast.promise(API.getSession(sId), {
        error: "Session doesn't exists.",
        loading: "Joining session",
        success: "Joined",
      });

      router.push("/trade?session=" + sId);
    } finally {
      setState(State.Idle);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col gap-20 items-center justify-center">
      <h1 className="text-3xl font-bold">NFT Swap</h1>
      <div className="flex gap-6 items-center justify-center">
        {!showSessionInput ? (
          <>
            <button
              className={`btn btn-primary ${
                state === State.Creating ? "loading" : ""
              }`}
              disabled={state !== State.Idle && state !== State.Creating}
              onClick={handleCreateSession}
            >
              Create Session
            </button>

            <button
              className={`btn btn-secondary btn-outline`}
              disabled={state !== State.Idle && state !== State.Joining}
              onClick={() => setShowSessionInput(true)}
            >
              Join Session
            </button>
          </>
        ) : (
          <div className="flex gap-4">
            <input
              onKeyDown={(e) => e.code == "Enter" && handleJoinSession()}
              type="text"
              placeholder="Enter Session Id"
              className="input input-bordered w-min-[15ch] w-max-[50ch]"
              disabled={state === State.Joining}
              value={sessionInput}
              onChange={(e) => setSessionInput(e.target.value)}
              autoFocus
            />
            <button
              className={`btn btn-secondary
            ${state == State.Joining ? "loading" : ""}`}
              onClick={handleJoinSession}
              disabled={sessionInput.length === 0}
            >
              Join
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
