import H1TeamRatings from "../components/H1TeamRatings";
import H2GeneralDif from "../components/H2GeneralDif";
import H3DecisionMatrix from "../components/H3DecisionMatrix";
import H4Correlation from "../components/H4Correlation";

const Home = () => {
  return (
    <div style={{ padding: "20px"}}>
      <h1>H1: Beurteilung der Teams (blind)</h1>
      <H1TeamRatings />
      <h1>H2: Vergleich - Standard vs Kalbrierter</h1>
      <H2GeneralDif />
      <h1>H3: Entscheidungsfaktoren Analyse</h1>
      <H3DecisionMatrix />
      <h1>H4: Korrelationsanalyse</h1>
      <H4Correlation />
    </div>
  );
};

export default Home;
