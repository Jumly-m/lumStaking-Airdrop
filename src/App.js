import Dashboard from "./components/Dashboard";
import "./assets/sass/index.scss";
import NavbarComp from "./components/NavbarComp";
import { WagmiConfig } from "wagmi";
import { ethereumClient, projectId, wagmiConfig } from "./utils/web3-utils";
import { Web3Modal } from "@web3modal/react";

function App() {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <div className="App">
          <NavbarComp />
          <Dashboard />
        </div>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}

export default App;
