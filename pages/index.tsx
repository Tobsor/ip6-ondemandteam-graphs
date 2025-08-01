import H1TeamRatings from "../components/H1TeamRatings";
import H2GeneralDif from "../components/H2GeneralDif";
import H3DecisionMatrix from "../components/H3DecisionMatrix";
import H4Correlation from "../components/H4Correlation";

const Home = () => {
  return (
    <div>
      <h1>H1: Team ratings (blind)</h1>
      <H1TeamRatings />
      <h1>H2: Comparison calibrated vs uncalibrated</h1>
      <H2GeneralDif />
      <h3>H3: Decision Matrix</h3>
      <H3DecisionMatrix />
      <h3>H4: Correlation</h3>
      <H4Correlation />
    </div>
  );
};

export default Home;
