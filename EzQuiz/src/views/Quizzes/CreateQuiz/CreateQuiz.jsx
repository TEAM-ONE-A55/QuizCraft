import { useEffect, useState, useContext } from "react";
import { Question } from "./questionClass";
import toast from "react-hot-toast";
import Select from "react-select";
import Categories from "../../../components/Categories/Categories";
import QuizVisibility from "../../../components/QuizVisibility/QuizVisibility";
import { QuizDifficulty } from "../../../components/QuizDifficulty/QuizDifficulty";
import Button from "../../../components/Button/Button";
import { AppContext } from "../../../context/AppContext";
import { useNavigate } from "react-router";
import { uploadQuizToDatabase, getAllQuizTitles } from "../../../services/quiz.service";
import { minimumQuizTitleLength, maximumQuizTitleLength } from "../../../constants/constants";
import { Input, initTWE } from "tw-elements";

initTWE({ Input });

export default function CreateQuiz() {
  const { user, userData } = useContext(AppContext);

  const navigate = useNavigate();

  const [quiz, setQuiz] = useState({
    title: "",
    category: "",
    visibility: "",
    difficulty: "",
    timeLimit: "",
    passingScore: "",
    startDate: "",
    endDate: "",
    creator: userData.handle,
    creatorAvatar: userData.avatar,
    questions: [],
    participants: [],
    groups: [],
    rooms: []
  });

  const [allQuizTitles, setAllQuizTitles] = useState([]);

  useEffect(() => {
    getAllQuizTitles().then(setAllQuizTitles);
  }, []);

  const handleChange = (key, value, indexQ = 0, indexO = 0) => {
    if (key === "question") {
      setQuiz({
        ...quiz,
        questions: quiz.questions.map((q, i) => {
          if (i !== indexQ) return q;
          return {
            ...q,
            [key]: value,
          };
        }),
      });
    } else if (key === "option") {
      setQuiz({
        ...quiz,
        questions: quiz.questions.map((q, i) => {
          if (i !== indexQ) return q;
          return {
            ...q,
            incorrect_answers: q.incorrect_answers.map((o, j) => {
              if (j !== indexO) return o;
              return value;
            }),
            mixedAnswers: q.mixedAnswers.map((o, j) => {
              if (j !== indexO) return o;
              return value;
            })
          };
        }),
      });
    } else {
      setQuiz({
        ...quiz,
        [key]: value,
      });
    }
  };

  const addQuestion = () => {
    if (!quiz.category) return toast.error("Please choose a category first!");
    if (!quiz.difficulty)
      return toast.error("Please choose a difficulty first!");
    if (quiz.questions.length > 29)
      return toast.error("You can have a maximum of 30 questions in a quiz");
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        new Question(quiz.category, quiz.difficulty, "multiple"),
      ],
    });
  };

  const removeQuestion = (indexQ) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.filter((q, i) => i !== indexQ),
    });
  };

  const addOption = (indexQ) => {
    if (quiz.questions[indexQ].incorrect_answers.length > 4)
      return toast.error("You can have a maximum of 5 options for a question");
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q, i) => {
        if (i !== indexQ) return q;
        return {
          ...q,
          incorrect_answers: [...q.incorrect_answers, ""],
          mixedAnswers: [...q.mixedAnswers, ""],
        };
      }),
    });
  };

  const removeOption = (indexQ, indexO) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q, i) => {
        if (i !== indexQ) return q;
        return {
          ...q,
          mixedAnswers: q.mixedAnswers.filter((o, j) => j !== indexO),
        };
      }),
    });
  };

  const setCorrectAnswer = (indexQ, value) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q, i) => {
        if (i !== indexQ) return q;
        return {
          ...q,
          correct_answer: value,
          incorrect_answers: q.mixedAnswers.filter((o) => o !== value)
        };
      }),
    });
  }

  const submitQuiz = async () => {
    if(!quiz.title) return toast.error("Please enter a title for the quiz");
    if(quiz.title.length < minimumQuizTitleLength) return toast.error("Title must be at least 3 characters long");
    if(quiz.title.length > maximumQuizTitleLength) return toast.error("Title must be at most 30 characters long");
    if(allQuizTitles.includes(quiz.title)) return toast.error("A quiz with this title already exists");
    if(!quiz.visibility) return toast.error("Please choose a visibility for the quiz");
    if(!quiz.category) return toast.error("Please choose a category for the quiz");
    if(!quiz.difficulty) return toast.error("Please choose a difficulty for the quiz");
    if(!quiz.timeLimit) return toast.error("Please enter a time limit for the quiz");
    if(quiz.timeLimit < 1) return toast.error("Time limit must be at least 1 minute");
    if(quiz.timeLimit > 60) return toast.error("Time limit must be at most 60 minutes");
    if(!quiz.passingScore) return toast.error("Please enter a passing score for the quiz");
    if(quiz.passingScore < 1) return toast.error("Passing score must be at least 1%");
    if(quiz.passingScore > 100) return toast.error("Passing score must be at most 100%");
    if(!quiz.startDate) return toast.error("Please enter a start date for the quiz");
    if(!quiz.endDate) return toast.error("Please enter an end date for the quiz");
    if(new Date(quiz.startDate) >= new Date(quiz.endDate)) return toast.error("Start date must be before end date");
    if(quiz.questions.length < 1) return toast.error("Please add at least one question to the quiz");
    let qerror = '';
    quiz.questions.forEach((q, i) => {
      if(!q.question) {
        qerror = `Please enter a title for question ${i + 1}`;
        return;
      }
      if (q.mixedAnswers.length < 2) {
        qerror = `Please add at least two options for question ${i + 1}`;
        return;
      }
      if (!q.correct_answer) {
        qerror = `Please choose a correct answer for question ${i + 1}`;
        return;
      }
    });
    if(qerror) return toast.error(qerror);
    await uploadQuizToDatabase(JSON.parse(JSON.stringify(quiz)));
    navigate(-1);
  }

  if (user && userData.role !== 'student') { return (
    <div className=" bg-neutral-100 max-w-3xl rounded-xl flex-col py-8 px-4 relative shadow-neutral-500 shadow-xl m-auto mt-4">
      <h1 className="text-2xl">Create Your Own Quiz</h1>
      
      <p>Choose visibility*</p>
      <QuizVisibility
        setVisibility={(visibility) => handleChange("visibility", visibility)}
      />

      <p>Choose a category*</p>
      <Categories
        setCategory={(category) => handleChange("category", category)}
      />

      <p>Choose difficulty*</p>
      <QuizDifficulty
        setDifficulty={(difficulty) => handleChange("difficulty", difficulty)}
      />

      <span>Time limit (minutes)*</span>
      <input type="number" min="1" max="60" step="1" onChange={e => handleChange("timeLimit", e.target.value)} />
      <br />

      <span>Passing score %*</span>
      <input type="number" min="1" max="100" step="1" onChange={e => handleChange("passingScore", e.target.value)} />
      <br />

      <span>Start date*</span>
      <input type="date" onChange={e => handleChange("startDate", e.target.value)} />
      <br />

      <span>End date*</span>
      <input type="date" onChange={e => handleChange("endDate", e.target.value)} />
      <br />

      <p>Quiz questions*</p>
      <button onClick={addQuestion}>New Question</button>
      {quiz.questions.map((question, indexQ) => {
        return (
          <div key={indexQ}>
            <h4>Question {indexQ + 1}</h4>
            <label htmlFor={`create-quiz-question-${indexQ}`}>
              Question {indexQ + 1} Title*
            </label>
            <br />
            <input
              id={`create-quiz-question-${indexQ}`}
              type="text"
              value={question.question}
              onChange={(e) => handleChange("question", e.target.value, indexQ)}
            />
            <br />
            <button onClick={() => addOption(indexQ)}>New Option</button>
            <br />
            {question.mixedAnswers.map((option, indexO) => {
              return (
                <div key={indexO}>
                  <label htmlFor={`create-quiz-option-${indexO}`}>
                    Option {indexO + 1}*
                  </label>
                  <br />
                  <input
                    id={`create-quiz-option-${indexO}`}
                    type="text"
                    value={option}
                    onChange={(e) =>
                      handleChange("option", e.target.value, indexQ, indexO)
                    }
                  />
                  <br />
                  <button onClick={() => removeOption(indexQ, indexO)}>
                    Remove Option
                  </button>
                </div>
              );
            })}

            <p>Choose correct answer*</p>
            <Select
              id="question-amount-dropdown-select"
              options={quiz.questions[indexQ].incorrect_answers.map((option) => {
                  return { value: option, label: option };
              })}
              onChange={(e) => setCorrectAnswer(indexQ, e.value)}
              className="basic-multi-select w-64 mx-auto"
            />
            <button onClick={() => removeQuestion(indexQ)}>
              Remove Question
            </button>
          </div>
        );
      })}
      <br />
      <Button onClick={submitQuiz}>Submit Quiz</Button>
    </div>
  )} else {
    setTimeout(() => {navigate('/')}, 3000);
    return (
      <div>
        <h1>You aren&apos;t authorized to create quizzes. Redirecting to homepage...</h1>
      </div>
    )
  }
} 