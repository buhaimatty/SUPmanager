import TransitionButton from "./helpers/TransitionButton.jsx";

const Home = () => {
  return (
    <div
      className="flex flex-col justify-center items-center 
        px-6 py-20 text-center"
    >
      <h2
        className="text-5xl text-gray-800 font-extrabold 
          w-[70%] mb-6"
      >
        It's time to manage <span className="text-primary">Superheroes</span>{" "}
        database
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Create, update, and find superheroes - all in one place.
        <br />
        SUPmanager makes hero management simple and fun.
      </p>
      <div className="mt-28">
        <TransitionButton href="#addHero" text="Create Superhero" />
      </div>
    </div>
  );
};

export default Home;
