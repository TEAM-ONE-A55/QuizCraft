import { useEffect, useState, useContext } from "react";
import Categories from "../../../components/Categories/Categories";
import QuizVisibility from "../../../components/QuizVisibility/QuizVisibility";
import { QuizDifficulty } from "../../../components/QuizDifficulty/QuizDifficulty";
import { AppContext } from "../../../context/AppContext";
import { useNavigate, useParams } from "react-router";
import { getAllQuizTitles, getQuizById } from "../../../services/quiz.service";
import { submitQuiz, handleQuizChange, addQuestion, setCorrectAnswer, removeQuestion } from "../CreateQuiz/create-quiz-functions";
import Datepicker from "react-tailwindcss-datepicker"; 
import NewQuestion from "../CreateQuiz/NewQuestion";

export default function EditQuiz() {
  const { user, userData } = useContext(AppContext);

  const { id } = useParams();

  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);

  const [allQuizTitles, setAllQuizTitles] = useState([]);

  const [datePicker, setDatePicker] = useState({ 
    startDate: '',
    endDate: ''
  }); 

  useEffect(() => {
    getQuizById(id).then(res => {
        if (res) {
            setQuiz(res);
            setDatePicker({
                startDate: res.startDate,
                endDate: res.endDate
            });
        } else navigate('*')
    })
  }, []);

  useEffect(() => {
    setQuiz({
      ...quiz,
      startDate: datePicker.startDate,
      endDate: datePicker.endDate,
    });
  }, [datePicker]);

  useEffect(() => {
    getAllQuizTitles().then(setAllQuizTitles);
  }, []);

  if (quiz && user && userData.role !== 'student') { return (
    <div className="mt-4">
      <h2 className="mb-6 mt-6 font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-4xl">
      Edit your quiz</h2>
      <div className=" bg-neutral-100 max-w-3xl rounded-xl flex-col py-8 px-10 relative shadow-neutral-500 shadow-xl m-auto mt-4 text-left">

        <div className="max-w-[80%] mx-auto">
          <span className="ml-2">Title<span className=" text-red-600 ml-1">*</span></span><br />
          <input
          value={quiz.title} 
          className="pl-3 outline-none border-none2 rounded-md p-2 w-full focus:border-blue-500 transition duration-300 ease-in-out" 
          type="text" placeholder="Add quiz title..." onChange={e => handleQuizChange(quiz, setQuiz, "title", e.target.value)} />
        </div>

        <div className="flex justify-center gap-8">
          <div className="w-[40%] m-4">
            <div className="mb-3">
              <span className="ml-2">Choose visibility<span className=" text-red-600 ml-1">*</span></span><br />
              <QuizVisibility
                initialValue={quiz.visibility}
                setVisibility={(visibility) => handleQuizChange(quiz, setQuiz, "visibility", visibility)}
              />
            </div>
            <div className="mb-3">
              <span className="ml-2">Choose category<span className=" text-red-600 ml-1">*</span></span><br />
              <Categories
                initialValue={quiz.category}
                setCategory={(category) => handleQuizChange(quiz, setQuiz, "category", category)}
              />
            </div>
            <div className="mb-3">
              <span className="ml-2">Choose difficulty<span className=" text-red-600 ml-1">*</span></span><br />
              <QuizDifficulty
                initialValue={quiz.difficulty}
                setDifficulty={(difficulty) => handleQuizChange(quiz, setQuiz, "difficulty", difficulty)}
              />
            </div>
          </div>

          <div className="w-[40%] m-4">
            <div className="mb-3">
              <span className="ml-2">Time limit (minutes)<span className=" text-red-600 ml-1">*</span></span><br />
              <input value={quiz?.timeLimit} className="pl-3 mx-3 w-64 rounded-md px-2 py-[7px] outline-none shadow-[5px 5px 10px rgba(0, 0, 0, 0.1)] shadow-lg" type="number" min="1" max="60" step="1" onChange={e => handleQuizChange(quiz, setQuiz, "timeLimit", e.target.value)} />
              <br />
            </div>

            <div className="mb-3">
              <span className="ml-2">Passing score (%)<span className=" text-red-600 ml-1">*</span></span><br />
              <input value={quiz?.passingScore} className="pl-3 mx-3 w-64 rounded-md px-2 py-[7px] outline-none shadow-[5px 5px 10px rgba(0, 0, 0, 0.1)] shadow-lg" type="number" min="1" max="100" step="1" onChange={e => handleQuizChange(quiz, setQuiz, "passingScore", e.target.value)} />
              <br />
            </div>

            <div className="mb-3 w-[100%]">
              <span className="ml-2">Quiz duration<span className=" text-red-600 ml-1">*</span></span><br />
              <div className=" mx-3">
                <Datepicker
                  inputClassName={"pl-2 outline-none rounded-md px-2 py-[9px] caret-transparent cursor-pointer w-[100%] text-sm shadow-[5px 5px 10px rgba(0, 0, 0, 0.1)] shadow-lg"}
                  containerClassName={""}
                  primaryColor={"yellow"} 
                  value={datePicker} 
                  onChange={e => setDatePicker(e)} 
                  showShortcuts={true}
                  separator="-"
                  popoverDirection="left"
                  /> 
              </div>
            </div>
          </div>
        </div>

        <div className="w-[80%] mx-auto mt-2">
          <div className="mx-auto">
            <button 
            className="mb-6 w-full block rounded-lg bg-neutral-300 px-6 pt-2.5 pb-2 text-sm font-medium uppercase leading-normal text-neutral-800 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-neutral-400 hover:shadow-neutral-800 focus:outline-none focus:ring-0"
            onClick={() => addQuestion(quiz, setQuiz)}>New Question</button>
          </div>

          {quiz && quiz?.questions?.map((question, indexQ) => <NewQuestion 
          key={indexQ} 
          quiz={quiz} 
          setQuiz={setQuiz} 
          question={question} 
          indexQ={indexQ} 
          handleChange={handleQuizChange} 
          setCorrectAnswer={setCorrectAnswer} 
          removeQuestion={removeQuestion} />)}

        </div>

        <button 
        className="w-[80%] mx-auto mt-8 block rounded-lg bg-yellow-400 px-6 pt-2.5 pb-2 text-sm font-medium uppercase leading-normal text-neutral-800 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-yellow-500 hover:shadow-neutral-800 focus:outline-none focus:ring-0"
        onClick={() => submitQuiz(quiz, allQuizTitles, navigate, 'editing')}>Submit Quiz</button>
      </div>
    </div>
  )}
} 