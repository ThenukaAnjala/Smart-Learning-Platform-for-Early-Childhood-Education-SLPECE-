import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

// Background image (replace with your file name, e.g., 'AnimalQuizFullScreenBG.jpg')
const backgroundImage = require('../assets/images/Background/NewAnimalQuizBG.jpg');

// Load questions from JSON file using require
const questions = require('../assets/data/questions.json');

// Import Lottie animations for Easy level animals
const birdAnimation = require('../assets/Animations/Animal-Animation/bird.json');
const catAnimation = require('../assets/Animations/Animal-Animation/cat.json');
const cowAnimation = require('../assets/Animations/Animal-Animation/cow.json');
const chickenAnimation = require('../assets/Animations/Animal-Animation/chicken.json');
const deerAnimation = require('../assets/Animations/Animal-Animation/deer.json');
const dogAnimation = require('../assets/Animations/Animal-Animation/dog-animation.json');
const donkeyAnimation = require('../assets/Animations/Animal-Animation/donkey.json');
const duckAnimation = require('../assets/Animations/Animal-Animation/duck.json');
const fishAnimation = require('../assets/Animations/Animal-Animation/fish.json');
const frogAnimation = require('../assets/Animations/Animal-Animation/frog.json');
const goatAnimation = require('../assets/Animations/Animal-Animation/goat.json');
const gooseAnimation = require('../assets/Animations/Animal-Animation/goose.json');
const hamsterAnimation = require('../assets/Animations/Animal-Animation/hamster.json');
const horseAnimation = require('../assets/Animations/Animal-Animation/horse.json');
const pigAnimation = require('../assets/Animations/Animal-Animation/pig.json');
const rabbitAnimation = require('../assets/Animations/Animal-Animation/rabbit.json');
const mouseAnimation = require('../assets/Animations/Animal-Animation/rat.json');
const sheepAnimation = require('../assets/Animations/Animal-Animation/sheep.json');
const squirrelAnimation = require('../assets/Animations/Animal-Animation/squirrel.json');
const turkeyAnimation = require('../assets/Animations/Animal-Animation/turkey.json');
// const defaultAnimation = require('../assets/Animations/Animal-Animation/celebration.json');

const animalAnimations = {
  bird: birdAnimation,
  cat: catAnimation,
  cow: cowAnimation,
  deer: deerAnimation,
  dog: dogAnimation,
  donkey: donkeyAnimation,
  duck: duckAnimation,
  fish: fishAnimation,
  frog: frogAnimation,
  goat: goatAnimation,
  goose: gooseAnimation,
  hamster: hamsterAnimation,
  horse: horseAnimation,
  pig: pigAnimation,
  rabbit: rabbitAnimation,
  mouse: mouseAnimation,
  sheep: sheepAnimation,
  squirrel: squirrelAnimation,
  turkey: turkeyAnimation,
  chicken: chickenAnimation,
  // default: defaultAnimation,
};

const AnimalQuizScreen = ({ navigation, route }) => {
  const [currentLevel, setCurrentLevel] = useState(route.params?.selectedLevel || 'easy');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [score, setScore] = useState({ easy: 0, medium: 0, hard: 0 });
  const [totalScore, setTotalScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [extraHint, setExtraHint] = useState(false);
  const [hasCheckedBadge, setHasCheckedBadge] = useState(false);
  const [retryCount, setRetryCount] = useState({ easy: 0, medium: 0, hard: 0 });
  const QUESTIONS_PER_LEVEL = 8;
  const MINIMUM_SCORE_TO_PROGRESS = 4;

  const animationRef = useRef(null);

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
    lockOrientation();

    const loadBadges = async () => {
      try {
        const savedBadges = await AsyncStorage.getItem('badges');
        if (savedBadges) setBadges(JSON.parse(savedBadges));
      } catch (error) {
        console.error('Error loading badges:', error);
      }
    };
    loadBadges();

    const fetchQuestions = () => {
      const levelQuestions = questions[currentLevel];
      const shuffledQuestions = levelQuestions.sort(() => 0.5 - Math.random()).slice(0, QUESTIONS_PER_LEVEL);
      setSelectedQuestions(shuffledQuestions);
      setIsLoading(false);
      setHasCheckedBadge(false);
    };
    fetchQuestions();

    return () => ScreenOrientation.unlockAsync();
  }, [currentLevel]);

  useEffect(() => {
    if (currentQuestionIndex >= selectedQuestions.length && !hasCheckedBadge) {
      checkBadge();
      setHasCheckedBadge(true);
    }
  }, [currentQuestionIndex, selectedQuestions.length, hasCheckedBadge]);

  const checkBadge = useCallback(async () => {
    const currentLevelScore = score[currentLevel];
    let updatedBadges = [...badges];

    if (currentLevel === 'easy' && currentLevelScore >= (retryCount.easy > 0 ? 5 : 6) && !badges.includes('Explorer')) {
      updatedBadges.push('Explorer');
    } else if (currentLevel === 'medium' && currentLevelScore >= (retryCount.medium > 0 ? 5 : 6) && !badges.includes('Adventurer')) {
      updatedBadges.push('Adventurer');
    } else if (currentLevel === 'hard' && currentLevelScore >= (retryCount.hard > 0 ? 5 : 6) && !badges.includes('Master')) {
      updatedBadges.push('Master');
      if (badges.includes('Explorer') && badges.includes('Adventurer') && !badges.includes('Super Animal Expert')) {
        updatedBadges.push('Super Animal Expert');
      }
    }

    setBadges(updatedBadges);
    try {
      await AsyncStorage.setItem('badges', JSON.stringify(updatedBadges));
    } catch (error) {
      console.error('Error saving badges:', error);
    }
  }, [badges, currentLevel, score, retryCount]);

  const handleAnswer = (selectedAnswer) => {
    const correctAnswer = selectedQuestions[currentQuestionIndex].answer;
    if (selectedAnswer === correctAnswer) {
      setScore({ ...score, [currentLevel]: score[currentLevel] + 1 });
      setTotalScore(totalScore + 1);
      setFeedbackText('Correct! 🎉');
      setIsCorrectAnswer(true);
      if (animationRef.current) {
        animationRef.current.play();
      }
    } else {
      setFeedbackText('Try again! 😊');
      setIsCorrectAnswer(false);
    }
    setShowFeedback(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const shuffleOptions = (options, answer) => {
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    if (!shuffled.includes(answer)) {
      shuffled[Math.floor(Math.random() * shuffled.length)] = answer;
    }
    return shuffled;
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setIsCorrectAnswer(false);
    if (animationRef.current) {
      animationRef.current.reset();
    }
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    fadeAnim.setValue(0);
  };

  const nextLevel = () => {
    if (score[currentLevel] < MINIMUM_SCORE_TO_PROGRESS) {
      setFeedbackText(`You need at least ${MINIMUM_SCORE_TO_PROGRESS}/8 to unlock the next level. Try again! 😊`);
      setShowFeedback(true);
      return;
    }

    setCurrentQuestionIndex(0);
    setShowFeedback(false);
    if (animationRef.current) {
      animationRef.current.reset();
    }
    fadeAnim.setValue(0);
    let nextLevelQuestions;
    if (currentLevel === 'easy') {
      setCurrentLevel('medium');
      nextLevelQuestions = questions.medium.sort(() => 0.5 - Math.random()).slice(0, QUESTIONS_PER_LEVEL);
    } else if (currentLevel === 'medium') {
      setCurrentLevel('hard');
      nextLevelQuestions = questions.hard.sort(() => 0.5 - Math.random()).slice(0, QUESTIONS_PER_LEVEL);
    }
    setSelectedQuestions(nextLevelQuestions);

    if (score[currentLevel] < 4) {
      setExtraHint(true);
    } else {
      setExtraHint(false);
    }

    const saveScoreAndRetry = async () => {
      try {
        const savedScores = await AsyncStorage.getItem('scores') || '{}';
        const scores = JSON.parse(savedScores);
        scores[currentLevel] = score[currentLevel];
        await AsyncStorage.setItem('scores', JSON.stringify(scores));
        const savedRetries = await AsyncStorage.getItem('retryCount') || '{}';
        const retries = JSON.parse(savedRetries);
        retries[currentLevel] = (retries[currentLevel] || 0) + 1;
        await AsyncStorage.setItem('retryCount', JSON.stringify(retries));
        setRetryCount(retries);
      } catch (error) {
        console.error('Error saving scores/retries:', error);
      }
    };
    saveScoreAndRetry();
  };

  if (currentLevel === 'hard' && currentQuestionIndex >= selectedQuestions.length) {
    return (
      <View style={styles.container}>
        <Image source={backgroundImage} style={styles.backgroundImage} />
        <Text style={styles.title}>Great Job!</Text>
        <Text style={styles.score}>Total Score: {totalScore}/24</Text>
        <Text style={styles.levelScore}>Easy: {score.easy}/8</Text>
        <Text style={styles.levelScore}>Medium: {score.medium}/8</Text>
        <Text style={styles.levelScore}>Hard: {score.hard}/8</Text>
        <Text style={styles.badgesText}>Badges: {badges.join(', ')}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('LevelSelection')}>
          <Text style={styles.backButtonText}>Choose Level</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setCurrentLevel('easy');
            setCurrentQuestionIndex(0);
            setScore({ easy: 0, medium: 0, hard: 0 });
            setTotalScore(0);
            setExtraHint(false);
            setHasCheckedBadge(false);
            setRetryCount({ easy: 0, medium: 0, hard: 0 });
            const shuffled = questions.easy.sort(() => 0.5 - Math.random());
            setSelectedQuestions(shuffled.slice(0, QUESTIONS_PER_LEVEL));
          }}
        >
          <Text style={styles.backButtonText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (currentQuestionIndex >= selectedQuestions.length) {
    return (
      <View style={styles.container}>
        <Image source={backgroundImage} style={styles.backgroundImage} />
        <Text style={styles.title}>Level {currentLevel === 'easy' ? 1 : currentLevel === 'medium' ? 2 : 3} Complete!</Text>
        <Text style={styles.score}>Score: {score[currentLevel]}/8</Text>
        {badges.includes(currentLevel === 'easy' ? 'Explorer' : currentLevel === 'medium' ? 'Adventurer' : 'Master') && (
          <Text style={styles.badgesText}>
            You earned the {currentLevel === 'easy' ? 'Explorer' : currentLevel === 'medium' ? 'Adventurer' : 'Master'} badge!
          </Text>
        )}
        {score[currentLevel] >= MINIMUM_SCORE_TO_PROGRESS ? (
          <TouchableOpacity style={styles.nextButton} onPress={nextLevel}>
            <Text style={styles.nextButtonText}>Next Level</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.retryMessage}>
            You need at least {MINIMUM_SCORE_TO_PROGRESS}/8 to unlock the next level. Try again! 😊
          </Text>
        )}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('LevelSelection')}>
          <Text style={styles.backButtonText}>Choose Level</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setCurrentQuestionIndex(0);
            setScore({ ...score, [currentLevel]: 0 });
            setHasCheckedBadge(false);
            setRetryCount({ ...retryCount, [currentLevel]: retryCount[currentLevel] + 1 });
            const shuffled = questions[currentLevel].sort(() => 0.5 - Math.random());
            setSelectedQuestions(shuffled.slice(0, QUESTIONS_PER_LEVEL));
          }}
        >
          <Text style={styles.backButtonText}>Retry Level</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading || selectedQuestions.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const currentHints = currentQuestion.hints;
  const currentOptions = currentQuestion.options;
  const displayedOptions = shuffleOptions(currentOptions, currentQuestion.answer);
  const displayedHints = extraHint ? [...currentHints, 'Ask for help if needed!'] : currentHints;

  const currentAnswer = currentQuestion.answer;
  const selectedAnimation = isCorrectAnswer
    ? currentLevel === 'easy'
      ? animalAnimations[currentAnswer] || animalAnimations.default
      : animalAnimations.default
    : null;

  return (
    <View style={styles.container}>
      <Image source={backgroundImage} style={styles.backgroundImage} />
      <Text style={styles.title}>Level {currentLevel === 'easy' ? 1 : currentLevel === 'medium' ? 2 : 3}</Text>
      <Text style={styles.title}>Animal Guess Game! 🎉</Text>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Who am I?</Text>
        {displayedHints.map((hint, index) => (
          <Text key={index} style={styles.hintText}>{hint}</Text>
        ))}
      </View>
      <View style={styles.optionsContainer}>
        {displayedOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleAnswer(option)}
            disabled={showFeedback}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {showFeedback && (
        <Animated.View style={[styles.fullFeedbackContainer, { opacity: fadeAnim }]}>
          <View style={styles.feedbackOverlay}>
            {isCorrectAnswer && selectedAnimation && (
              <LottieView
                ref={animationRef}
                source={selectedAnimation}
                autoPlay
                loop={true}
                style={styles.animation}
              />
            )}
            <Text style={styles.feedbackText}>{feedbackText}</Text>
            <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
      <Text style={styles.scoreText}>Score: {score[currentLevel]}/{selectedQuestions.length}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20,
    backgroundColor: 'transparent', // Ensure container doesn’t interfere with background
  },
  backgroundImage: { 
    position: 'absolute', 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover', // Ensures full screen coverage
  },
  title: { 
    fontSize: 40, 
    color: '#8B4513', 
    fontFamily: 'Schoolbell', 
    textAlign: 'center', 
    marginTop: 40, // Increased to avoid overlap with status bar
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly more opaque for readability
    padding: 20,
    borderRadius: 20,
    marginVertical: 10,
    alignItems: 'center',
    width: '90%',
  },
  questionText: { fontSize: 24, color: '#333', fontFamily: 'Poppins', textAlign: 'center' },
  hintText: { fontSize: 18, color: '#333', fontFamily: 'Poppins', textAlign: 'center', marginVertical: 5 },
  optionsContainer: { 
    flexDirection: 'column', 
    alignItems: 'center', 
    width: '90%',
    marginBottom: 120, // Increased to ensure options don’t overlap with grass/animals
  },
  optionButton: {
    backgroundColor: '#D2691E',
    padding: 15,
    marginVertical: 10,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
  },
  optionText: { color: '#FFF', fontSize: 18, fontFamily: 'Poppins', textAlign: 'center' },
  fullFeedbackContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  animation: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  feedbackText: { color: '#FFF', fontSize: 32, fontFamily: 'Poppins', textAlign: 'center', marginBottom: 20 },
  nextButton: {
    backgroundColor: '#D2691E',
    padding: 15,
    borderRadius: 30,
    width: '60%',
    alignItems: 'center',
  },
  nextButtonText: { color: '#FFF', fontSize: 20, fontFamily: 'Poppins', textAlign: 'center' },
  backButton: {
    backgroundColor: '#D2691E',
    padding: 15,
    borderRadius: 30,
    marginTop: 10,
    width: '60%',
    alignItems: 'center',
  },
  backButtonText: { color: '#FFF', fontSize: 20, fontFamily: 'Poppins' },
  scoreText: { 
    position: 'absolute', 
    bottom: 80, // Adjusted to sit above the grass/animals
    color: '#FFF', 
    fontSize: 20, 
    fontFamily: 'Poppins',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Added background for readability
    padding: 5,
    borderRadius: 10,
  },
  score: { fontSize: 24, color: '#FFF', fontFamily: 'Poppins', marginVertical: 10 },
  levelScore: { fontSize: 20, color: '#FFF', fontFamily: 'Poppins', marginVertical: 5 },
  badgesText: { fontSize: 20, color: '#FFF', fontFamily: 'Poppins', marginVertical: 10 },
  retryMessage: { fontSize: 18, color: '#FFF', fontFamily: 'Poppins', textAlign: 'center', marginVertical: 10 },
});

export default AnimalQuizScreen;