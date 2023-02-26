import { ConnectKitButton } from "connectkit";

export default function Swapped() {
  return (
    <div className="flex flex-col w-screen min-h-screen">
      <div className="flex w-full justify-end px-3 py-2 ">
        <ConnectKitButton showAvatar />
      </div>
      <div className="flex flex-col p-2 flex-1 items-center gap-6 justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          fill="currentColor"
          className="bi bi-arrow-left-right w-16 h-16"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z"
          />
        </svg>

        <p className="text-xl font-semibold m-3">NFTs have been swapped.</p>
      </div>
    </div>
  );
}
