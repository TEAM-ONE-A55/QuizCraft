import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { auth } from "./config/firebase.config";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getUserData } from "./services/user.service";
import { AppContext } from "./context/AppContext";
import Home from "./views/Home/Home";
import Footer from "./components/Footer/Footer";
import Login from "./views/Login/Login";
import Registration from "./views/Registration/Registration";
import SingleQuiz from "./views/Quizzes/SingleQuiz/SingleQuiz";
import SampleQuiz from "./views/Quizzes/SampleQuiz/SampleQuiz";
import {
  defaultQuizAmountSample,
  defaultQuizDifficultySamle,
} from "./constants/constants";
import Profile from "./views/Profile/Profile";
import Authenticated from "./hoc/Authenticated/Authenticated";
import CreateRoom from "./views/EducatorDashboard/CreateRoom/CreateRoom";
import CreateGroup from "./views/EducatorDashboard/CreateGroup/CreateGroup";
import NavBar from "./components/NavBar/NavBar";
import StudentsDashboard from "./views/Students Landing Page/Students-Dashboard";
import Scoreboards from "./views/Scoreboard/Scoreboards";

export default function App() {
  const [user] = useAuthState(auth);
  const [context, setContext] = useState({
    user: null,
    userData: null,
  });

  const [difficulty, setDifficulty] = useState(defaultQuizDifficultySamle);
  const [quizAmount, setQuizAmount] = useState(defaultQuizAmountSample);

  useEffect(() => {
    if (user) {
      getUserData(user.uid).then((snapshot) => {
        if (snapshot.exists()) {
          setContext({
            user,
            userData: snapshot.val()[Object.keys(snapshot.val())[0]],
          });
        }
      });
    }
  }, [user]);

  return (
    <>
      <BrowserRouter>
        <AppContext.Provider value={{ ...context, setContext: setContext }}>
          <Toaster position="bottom-right" reverseOrder={true} />
          {/* <Header /> */}
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/signup" element={<Registration />}></Route>
            <Route path="/signin" element={<Login />}></Route>
            <Route
              path="/sample-quiz/:id"
              element={
                <SingleQuiz
                  difficulty={difficulty}
                  setDifficulty={setDifficulty}
                  quizAmount={quizAmount}
                  setQuizAmount={setQuizAmount}
                />
              }
            ></Route>
            <Route
              path="/sample-quiz"
              element={
                <SampleQuiz
                  setDifficulty={setDifficulty}
                  setQuizAmount={setQuizAmount}
                />
              }
            ></Route>
            <Route
              path="/profile"
              element={
                <Authenticated>
                  <Profile />
                </Authenticated>
              }
            ></Route>
            <Route
              path="/create-room"
              element={
                <Authenticated>
                  <CreateRoom />
                </Authenticated>
              }
            ></Route>
            <Route
              path="/create-group"
              element={
                <Authenticated>
                  <CreateGroup />
                </Authenticated>
              }
            ></Route>
            <Route
              path="/dashboard"
              element={
                <Authenticated>
                  <StudentsDashboard />
                </Authenticated>
              }
            ></Route>
            <Route
              path="scoreboard"
              element={
                <Authenticated>
                  <Scoreboards />
                </Authenticated>
              }
            ></Route>
          </Routes>
          <Footer />
        </AppContext.Provider>
      </BrowserRouter>
    </>
  );
}
