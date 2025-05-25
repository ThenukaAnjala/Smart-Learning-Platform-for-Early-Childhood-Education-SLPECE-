import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Dimensions, ScrollView } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

// Get screen dimensions for full-screen background
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Background image
const backgroundImage = require('../assets/images/Background/NewAnimalQuizBG.jpg');

// Load questions from JSON file
const questions = require('../assets/data/questions.json');

// Load sound files
const correctSoundFile = require('../assets/AnimalQuizSounds/correct.mp3');
const wrongSoundFile = require('../assets/AnimalQuizSounds/wrong.wav');

// Import all 101 animal images with updated Quiz path
const dogImage = require('../assets/images/Quiz/dog.png');
const catImage = require('../assets/images/Quiz/cat.png');
const cowImage = require('../assets/images/Quiz/cow.png');
const horseImage = require('../assets/images/Quiz/horse.png');
const sheepImage = require('../assets/images/Quiz/sheep.png');
const pigImage = require('../assets/images/Quiz/pig.png');
const chickenImage = require('../assets/images/Quiz/chicken.png');
const duckImage = require('../assets/images/Quiz/duck.png');
const goatImage = require('../assets/images/Quiz/goat.png');
const rabbitImage = require('../assets/images/Quiz/rabbit.png');
const fishImage = require('../assets/images/Quiz/fish.png');
const birdImage = require('../assets/images/Quiz/bird.png');
const mouseImage = require('../assets/images/Quiz/mouse.png');
const frogImage = require('../assets/images/Quiz/frog.png');
const elephantImage = require('../assets/images/Quiz/elephant.png');
const monkeyImage = require('../assets/images/Quiz/monkey.png');
const parrotImage = require('../assets/images/Quiz/parrot.png');
const henImage = require('../assets/images/Quiz/hen.png');
const buffaloImage = require('../assets/images/Quiz/buffalo.png');
const donkeyImage = require('../assets/images/Quiz/donkey.png');
const squirrelImage = require('../assets/images/Quiz/squirrel.png');
const peacockImage = require('../assets/images/Quiz/peacock.png');
const crabImage = require('../assets/images/Quiz/crab.png');
const butterflyImage = require('../assets/images/Quiz/butterfly.png');
const beeImage = require('../assets/images/Quiz/bee.png');
const antImage = require('../assets/images/Quiz/ant.png');
const turtleImage = require('../assets/images/Quiz/turtle.png');
const snakeImage = require('../assets/images/Quiz/snake.png');
const lizardImage = require('../assets/images/Quiz/lizard.png');
const crowImage = require('../assets/images/Quiz/crow.png');
const sparrowImage = require('../assets/images/Quiz/sparrow.png');
const pigeonImage = require('../assets/images/Quiz/pigeon.png');
const mynaImage = require('../assets/images/Quiz/myna.png');
const deerImage = require('../assets/images/Quiz/deer.png');
const gooseImage = require('../assets/images/Quiz/goose.png');
const hamsterImage = require('../assets/images/Quiz/hamster.png');
const kittenImage = require('../assets/images/Quiz/kitten.png');
const puppyImage = require('../assets/images/Quiz/puppy.png');
const lambImage = require('../assets/images/Quiz/lamb.png');
const calfImage = require('../assets/images/Quiz/calf.png');
const leopardImage = require('../assets/images/Quiz/leopard.png');
const mongooseImage = require('../assets/images/Quiz/mongoose.png');
const crocodileImage = require('../assets/images/Quiz/crocodile.png');
const bearImage = require('../assets/images/Quiz/bear.png');
const giraffeImage = require('../assets/images/Quiz/giraffe.png');
const zebraImage = require('../assets/images/Quiz/zebra.png');
const kangarooImage = require('../assets/images/Quiz/kangaroo.png');
const pandaImage = require('../assets/images/Quiz/panda.png');
const penguinImage = require('../assets/images/Quiz/penguin.png');
const sealImage = require('../assets/images/Quiz/seal.png');
const wolfImage = require('../assets/images/Quiz/wolf.png');
const foxImage = require('../assets/images/Quiz/fox.png');
const otterImage = require('../assets/images/Quiz/otter.png');
const beaverImage = require('../assets/images/Quiz/beaver.png');
const camelImage = require('../assets/images/Quiz/camel.png');
const hippoImage = require('../assets/images/Quiz/hippo.png');
const rhinoImage = require('../assets/images/Quiz/rhino.png');
const koalaImage = require('../assets/images/Quiz/koala.png');
const batImage = require('../assets/images/Quiz/bat.png');
const porcupineImage = require('../assets/images/Quiz/porcupine.png');
const hedgehogImage = require('../assets/images/Quiz/hedgehog.png');
const tigerImage = require('../assets/images/Quiz/tiger.png');
const lionImage = require('../assets/images/Quiz/lion.png');
const cobraImage = require('../assets/images/Quiz/cobra.png');
const eagleImage = require('../assets/images/Quiz/eagle.png');
const owlImage = require('../assets/images/Quiz/owl.png');
const flamingoImage = require('../assets/images/Quiz/flamingo.png');
const dolphinImage = require('../assets/images/Quiz/dolphin.png');
const sharkImage = require('../assets/images/Quiz/shark.png');
const whaleImage = require('../assets/images/Quiz/whale.png');
const toadImage = require('../assets/images/Quiz/toad.png');
const craneImage = require('../assets/images/Quiz/crane.png');
const kingfisherImage = require('../assets/images/Quiz/kingfisher.png');
const slothBearImage = require('../assets/images/Quiz/sloth_bear.png');
const pangolinImage = require('../assets/images/Quiz/pangolin.png');
const hornbillImage = require('../assets/images/Quiz/hornbill.png');
const cheetahImage = require('../assets/images/Quiz/cheetah.png');
const alligatorImage = require('../assets/images/Quiz/alligator.png');
const viperImage = require('../assets/images/Quiz/viper.png');
const chameleonImage = require('../assets/images/Quiz/chameleon.png');
const hawkImage = require('../assets/images/Quiz/hawk.png');
const jackalImage = require('../assets/images/Quiz/jackal.png');
const hyenaImage = require('../assets/images/Quiz/hyena.png');
const toqueMacaqueImage = require('../assets/images/Quiz/toque_macaque.png');
const lorisImage = require('../assets/images/Quiz/loris.png');
const flyingFoxImage = require('../assets/images/Quiz/flying_fox.png');
const dugongImage = require('../assets/images/Quiz/dugong.png');
const sambarDeerImage = require('../assets/images/Quiz/sambar_deer.png');
const wildBoarImage = require('../assets/images/Quiz/wild_boar.png');
const storkImage = require('../assets/images/Quiz/stork.png');
const pelicanImage = require('../assets/images/Quiz/pelican.png');
const monitorLizardImage = require('../assets/images/Quiz/monitor_lizard.png');
const pythonImage = require('../assets/images/Quiz/python.png');
const macaqueImage = require('../assets/images/Quiz/macaque.png');
const starTortoiseImage = require('../assets/images/Quiz/star_tortoise.png');
const junglefowlImage = require('../assets/images/Quiz/junglefowl.png');
const serpentEagleImage = require('../assets/images/Quiz/serpent_eagle.png');
const blueWhaleImage = require('../assets/images/Quiz/blue_whale.png');
const spottedDeerImage = require('../assets/images/Quiz/spotted_deer.png');
const fishingCatImage = require('../assets/images/Quiz/fishing_cat.png');
const goldenPalmCivetImage = require('../assets/images/Quiz/golden_palm_civet.png');

// Mapping of animal answers to their respective images
const animalImages = {
  dog: dogImage,
  cat: catImage,
  cow: cowImage,
  horse: horseImage,
  sheep: sheepImage,
  pig: pigImage,
  chicken: chickenImage,
  duck: duckImage,
  goat: goatImage,
  rabbit: rabbitImage,
  fish: fishImage,
  bird: birdImage,
  mouse: mouseImage,
  frog: frogImage,
  elephant: elephantImage,
  monkey: monkeyImage,
  parrot: parrotImage,
  hen: henImage,
  buffalo: buffaloImage,
  donkey: donkeyImage,
  squirrel: squirrelImage,
  peacock: peacockImage,
  crab: crabImage,
  butterfly: butterflyImage,
  bee: beeImage,
  ant: antImage,
  turtle: turtleImage,
  snake: snakeImage,
  lizard: lizardImage,
  crow: crowImage,
  sparrow: sparrowImage,
  pigeon: pigeonImage,
  myna: mynaImage,
  deer: deerImage,
  goose: gooseImage,
  hamster: hamsterImage,
  kitten: kittenImage,
  puppy: puppyImage,
  lamb: lambImage,
  calf: calfImage,
  leopard: leopardImage,
  mongoose: mongooseImage,
  crocodile: crocodileImage,
  bear: bearImage,
  giraffe: giraffeImage,
  zebra: zebraImage,
  kangaroo: kangarooImage,
  panda: pandaImage,
  penguin: penguinImage,
  seal: sealImage,
  wolf: wolfImage,
  fox: foxImage,
  otter: otterImage,
  beaver: beaverImage,
  camel: camelImage,
  hippo: hippoImage,
  rhino: rhinoImage,
  koala: koalaImage,
  bat: batImage,
  porcupine: porcupineImage,
  hedgehog: hedgehogImage,
  tiger: tigerImage,
  lion: lionImage,
  cobra: cobraImage,
  eagle: eagleImage,
  owl: owlImage,
  flamingo: flamingoImage,
  dolphin: dolphinImage,
  shark: sharkImage,
  whale: whaleImage,
  toad: toadImage,
  crane: craneImage,
  kingfisher: kingfisherImage,
  'sloth bear': slothBearImage,
  pangolin: pangolinImage,
  hornbill: hornbillImage,
  cheetah: cheetahImage,
  alligator: alligatorImage,
  viper: viperImage,
  chameleon: chameleonImage,
  hawk: hawkImage,
  jackal: jackalImage,
  hyena: hyenaImage,
  'toque macaque': toqueMacaqueImage,
  loris: lorisImage,
  'flying fox': flyingFoxImage,
  dugong: dugongImage,
  'sambar deer': sambarDeerImage,
  'wild boar': wildBoarImage,
  stork: storkImage,
  pelican: pelicanImage,
  'monitor lizard': monitorLizardImage,
  python: pythonImage,
  macaque: macaqueImage,
  'star tortoise': starTortoiseImage,
  junglefowl: junglefowlImage,
  'serpent eagle': serpentEagleImage,
  'blue whale': blueWhaleImage,
  'spotted deer': spottedDeerImage,
  'fishing cat': fishingCatImage,
  'golden palm civet': goldenPalmCivetImage,
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
  const [imageAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [extraHint, setExtraHint] = useState(false);
  const [hasCheckedBadge, setHasCheckedBadge] = useState(false);
  const [retryCount, setRetryCount] = useState({ easy: 0, medium: 0, hard: 0 });
  const [correctSound, setCorrectSound] = useState(null);
  const [wrongSound, setWrongSound] = useState(null);
  const QUESTIONS_PER_LEVEL = 8;
  const REQUIRED_CORRECT_ANSWERS = 8;

  // Load and configure sounds
  useEffect(() => {
    const loadSounds = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const correctSoundObj = new Audio.Sound();
        const wrongSoundObj = new Audio.Sound();

        await correctSoundObj.loadAsync(correctSoundFile);
        await wrongSoundObj.loadAsync(wrongSoundFile);

        await correctSoundObj.setVolumeAsync(0.7);
        await wrongSoundObj.setVolumeAsync(0.5);

        setCorrectSound(correctSoundObj);
        setWrongSound(wrongSoundObj);
      } catch (error) {
        console.error('Error loading sounds:', error);
      }
    };

    loadSounds();

    return () => {
      if (correctSound) correctSound.unloadAsync();
      if (wrongSound) wrongSound.unloadAsync();
    };
  }, []);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentQuestionIndex + 1) / QUESTIONS_PER_LEVEL,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex]);

  // Reset unlockedLevels to a consistent state on component mount
  useEffect(() => {
    const resetUnlockedLevels = async () => {
      try {
        const savedLevels = await AsyncStorage.getItem('unlockedLevels');
        let unlockedLevels = savedLevels ? JSON.parse(savedLevels) : { level1: true, level2: false, level3: false };

        // Ensure sequential unlocking: if level3 is true, level2 must be true
        if (unlockedLevels.level3 && !unlockedLevels.level2) {
          unlockedLevels.level2 = true;
          console.log('Fixed inconsistency: Set level2 to true because level3 was true');
        }
        // If both are true, reset to initial state for testing
        if (unlockedLevels.level2 && unlockedLevels.level3) {
          unlockedLevels = { level1: true, level2: false, level3: false };
          console.log('Reset unlockedLevels to initial state for testing');
        }

        await AsyncStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
        console.log('Initial unlockedLevels:', unlockedLevels);
      } catch (error) {
        console.error('Error resetting unlockedLevels:', error);
      }
    };

    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
    lockOrientation();

    const loadBadgesAndRetries = async () => {
      try {
        const savedBadges = await AsyncStorage.getItem('badges');
        if (savedBadges) setBadges(JSON.parse(savedBadges));

        const savedRetries = await AsyncStorage.getItem('retryCount');
        if (savedRetries) setRetryCount(JSON.parse(savedRetries));
      } catch (error) {
        console.error('Error loading badges/retries:', error);
      }
    };
    loadBadgesAndRetries();

    const fetchQuestions = () => {
      const levelQuestions = questions[currentLevel] || [];
      if (levelQuestions.length === 0) {
        console.error(`No questions found for level: ${currentLevel}`);
        setIsLoading(false);
        return;
      }
      const shuffledQuestions = levelQuestions.sort(() => 0.5 - Math.random()).slice(0, QUESTIONS_PER_LEVEL);
      setSelectedQuestions(shuffledQuestions);
      setIsLoading(false);
      setHasCheckedBadge(false);
      progressAnim.setValue(0);
    };

    resetUnlockedLevels();
    fetchQuestions();

    return () => ScreenOrientation.unlockAsync();
  }, [currentLevel]);

  const checkBadgeAndUnlockNextLevel = useCallback(async (currentLevelScore) => {
    console.log(`Current Level: ${currentLevel}, Score: ${currentLevelScore}/${QUESTIONS_PER_LEVEL}`);
    let updatedBadges = [...badges];

    if (currentLevel === 'easy' && currentLevelScore >= (retryCount.easy > 0 ? 5 : 6) && !badges.includes('Explorer')) {
      updatedBadges.push('Explorer');
      console.log('Badge earned: Explorer');
    } else if (currentLevel === 'medium' && currentLevelScore >= (retryCount.medium > 0 ? 5 : 6) && !badges.includes('Adventurer')) {
      updatedBadges.push('Adventurer');
      console.log('Badge earned: Adventurer');
    } else if (currentLevel === 'hard' && currentLevelScore >= (retryCount.hard > 0 ? 5 : 6) && !badges.includes('Master')) {
      updatedBadges.push('Master');
      if (badges.includes('Explorer') && badges.includes('Adventurer') && !badges.includes('Super Animal Expert')) {
        updatedBadges.push('Super Animal Expert');
        console.log('Badge earned: Super Animal Expert');
      }
      console.log('Badge earned: Master');
    }

    setBadges(updatedBadges);
    try {
      await AsyncStorage.setItem('badges', JSON.stringify(updatedBadges));
      console.log('Badges saved to AsyncStorage:', updatedBadges);
    } catch (error) {
      console.error('Error saving badges:', error);
    }

    // Unlock the next level if all answers are correct
    if (currentLevelScore === QUESTIONS_PER_LEVEL) {
      try {
        const savedLevels = await AsyncStorage.getItem('unlockedLevels');
        let unlockedLevels = savedLevels ? JSON.parse(savedLevels) : { level1: true, level2: false, level3: false };
        console.log('Current unlockedLevels before update:', unlockedLevels);

        if (currentLevel === 'easy' && !unlockedLevels.level2) {
          unlockedLevels.level2 = true;
          console.log('Unlocked Level 2');
        } else if (currentLevel === 'medium' && !unlockedLevels.level3 && unlockedLevels.level2) {
          unlockedLevels.level3 = true;
          console.log('Unlocked Level 3');
        }

        console.log('Updated unlockedLevels:', unlockedLevels);
        await AsyncStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
        // Verify the save by reading back immediately
        const verifyLevels = await AsyncStorage.getItem('unlockedLevels');
        console.log('Verified unlockedLevels after save:', JSON.parse(verifyLevels));
      } catch (error) {
        console.error('Error unlocking next level:', error);
      }
    } else {
      console.log(`Level not unlocked. Required score: ${QUESTIONS_PER_LEVEL}, Achieved score: ${currentLevelScore}`);
    }
  }, [badges, currentLevel, retryCount]);

  const handleAnswer = async (selectedAnswer) => {
    const correctAnswer = selectedQuestions[currentQuestionIndex].answer;
    let newLevelScore = score[currentLevel]; // Track score locally

    if (selectedAnswer === correctAnswer) {
      newLevelScore += 1; // Increment local score
      setScore((prevScore) => {
        const newScore = { ...prevScore, [currentLevel]: newLevelScore };
        console.log(`Score updated for ${currentLevel}: ${newScore[currentLevel]}`);
        return newScore;
      });
      setTotalScore((prevTotal) => prevTotal + 1);
      setFeedbackText('Correct! 🎉');
      setIsCorrectAnswer(true);
      try {
        if (correctSound) {
          await correctSound.replayAsync();
        }
      } catch (error) {
        console.error('Error playing correct sound (MP3):', error);
      }
      Animated.timing(imageAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      setFeedbackText('Try again! 😊');
      setIsCorrectAnswer(false);
      try {
        if (wrongSound) {
          await wrongSound.replayAsync();
        }
      } catch (error) {
        console.error('Error playing wrong sound (WAV):', error);
      }
    }
    setShowFeedback(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Check badges and unlock next level after the last question
    if (currentQuestionIndex === QUESTIONS_PER_LEVEL - 1 && !hasCheckedBadge) {
      await checkBadgeAndUnlockNextLevel(newLevelScore);
      setHasCheckedBadge(true);
    }
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
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    fadeAnim.setValue(0);
    imageAnim.setValue(0);
  };

  const nextLevel = () => {
    if (score[currentLevel] < REQUIRED_CORRECT_ANSWERS) {
      setFeedbackText(`You need ${REQUIRED_CORRECT_ANSWERS}/8 correct answers to unlock the next level. Try again! 😊`);
      setShowFeedback(true);
      return;
    }

    setCurrentQuestionIndex(0);
    setShowFeedback(false);
    fadeAnim.setValue(0);
    progressAnim.setValue(0);
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.contentWrapper}>
            <Text style={styles.title}>Great Job!</Text>
            <Text style={styles.score}>Total Score: {totalScore}/24</Text>
            <Text style={styles.levelScore}>Easy: {score.easy}/8</Text>
            <Text style={styles.levelScore}>Medium: {score.medium}/8</Text>
            <Text style={styles.levelScore}>Hard: {score.hard}/8</Text>
            <Text style={styles.badgesText}>Badges: {badges.join(', ')}</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}
              accessible
              accessibilityLabel="Back to home"
              accessibilityRole="button"
            >
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('LevelSelectionScreen')}
              accessible
              accessibilityLabel="Choose level"
              accessibilityRole="button"
            >
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
                setSelectedQuestions(questions.easy.sort(() => 0.5 - Math.random()).slice(0, QUESTIONS_PER_LEVEL));
                progressAnim.setValue(0);
              }}
              accessible
              accessibilityLabel="Play again"
              accessibilityRole="button"
            >
              <Text style={styles.backButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (currentQuestionIndex >= selectedQuestions.length) {
    return (
      <View style={styles.container}>
        <Image source={backgroundImage} style={styles.backgroundImage} />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.contentWrapper}>
            <Text style={styles.title}>Level {currentLevel === 'easy' ? 1 : currentLevel === 'medium' ? 2 : 3} Complete!</Text>
            <Text style={styles.score}>Score: {score[currentLevel]}/8</Text>
            {badges.includes(currentLevel === 'easy' ? 'Explorer' : currentLevel === 'medium' ? 'Adventurer' : 'Master') && (
              <Text style={styles.badgesText}>
                You earned the {currentLevel === 'easy' ? 'Explorer' : currentLevel === 'medium' ? 'Adventurer' : 'Master'} badge!
              </Text>
            )}
            {score[currentLevel] >= REQUIRED_CORRECT_ANSWERS ? (
              currentLevel !== 'hard' ? (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={nextLevel}
                  accessible
                  accessibilityLabel="Next level"
                  accessibilityRole="button"
                >
                  <Text style={styles.nextButtonText}>Next Level</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.congratsText}>All Levels Completed! Check the Level Selection for your reward!</Text>
              )
            ) : (
              <Text style={styles.retryMessage}>
                You need {REQUIRED_CORRECT_ANSWERS}/8 correct answers to unlock the next level. Try again! 😊
              </Text>
            )}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('LevelSelectionScreen')}
              accessible
              accessibilityLabel="Choose level"
              accessibilityRole="button"
            >
              <Text style={styles.backButtonText}>Choose Level</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setCurrentQuestionIndex(0);
                setScore({ ...score, [currentLevel]: 0 });
                setHasCheckedBadge(false); // Reset to allow re-checking badges and unlocking
                setRetryCount({ ...retryCount, [currentLevel]: retryCount[currentLevel] + 1 });
                setSelectedQuestions(questions[currentLevel].sort(() => 0.5 - Math.random()).slice(0, QUESTIONS_PER_LEVEL));
                progressAnim.setValue(0);
              }}
              accessible
              accessibilityLabel="Retry level"
              accessibilityRole="button"
            >
              <Text style={styles.backButtonText}>Retry Level</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (isLoading || selectedQuestions.length === 0) {
    return (
      <View style={styles.container}>
        <Image source={backgroundImage} style={styles.backgroundImage} />
        <View style={styles.contentWrapper}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const currentHints = currentQuestion.hints;
  const currentOptions = currentQuestion.options;
  const displayedOptions = shuffleOptions(currentOptions, currentQuestion.answer);
  const displayedHints = extraHint ? [...currentHints, 'Ask for help if needed!'] : currentHints;
  const currentAnswer = currentQuestion.answer;
  const selectedImage = isCorrectAnswer ? animalImages[currentAnswer] : null;

  return (
    <View style={styles.container}>
      <Image source={backgroundImage} style={styles.backgroundImage} />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <Text style={[styles.title, styles.levelTitle]}>Level {currentLevel === 'easy' ? 1 : currentLevel === 'medium' ? 2 : 3}</Text>
          <View
            style={styles.progressBarContainer}
            accessible
            accessibilityLabel={`Progress: ${currentQuestionIndex + 1} of ${QUESTIONS_PER_LEVEL} questions`}
            accessibilityRole="progressbar"
          >
            <View style={styles.progressBarTrack}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>
          <Text style={styles.title}>Animal Guess Game! 🎉</Text>
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>Who am I?</Text>
            {displayedHints.map((hint, index) => (
              <Text key={index} style={styles.hintText} accessible accessibilityLabel={`Hint ${index + 1}: ${hint}`}>
                {hint}
              </Text>
            ))}
          </View>
          <View style={styles.optionsContainer}>
            {displayedOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, showFeedback && { opacity: 0.6 }]}
                onPress={() => handleAnswer(option)}
                disabled={showFeedback}
                accessible
                accessibilityLabel={`Option ${index + 1}: ${option}`}
                accessibilityRole="button"
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.scoreText}>Score: {score[currentLevel]}/{selectedQuestions.length}</Text>
        </View>
      </ScrollView>
      {showFeedback && (
        <Animated.View style={[styles.fullFeedbackContainer, { opacity: fadeAnim }]}>
          <View style={styles.feedbackOverlay}>
            {isCorrectAnswer && selectedImage && (
              <Animated.Image
                source={selectedImage}
                style={[styles.animalImage, { opacity: imageAnim }]}
              />
            )}
            <Text style={styles.feedbackText}>{feedbackText}</Text>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={nextQuestion}
              accessible
              accessibilityLabel="Next question"
              accessibilityRole="button"
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scrollContainer: {
    flexGrow:1,
    paddingVertical: 20,
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    color: '#333',
    fontFamily: 'Schoolbell',
    textAlign: 'center',
    marginBottom: 15,
  },
  levelTitle: {
    marginBottom: 10,
  },
  progressBarContainer: {
    width: '95%',
    marginVertical: 10,
  },
  progressBarTrack: {
    backgroundColor: '#D3D3D3',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: '#32CD32',
    height: '100%',
    borderRadius: 5,
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 20,
    marginVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  questionText: {
    fontSize: 24,
    color: '#333',
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  hintText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginVertical: 5,
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  optionButton: {
    backgroundColor: '#D2691E',
    padding: 12,
    marginVertical: 8,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
  },
  optionText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  fullFeedbackContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackOverlay: {
    backgroundColor: 'rgba(128, 128, 128, 0.7)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  animalImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  feedbackText: {
    color: '#FFF',
    fontSize: 32,
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#D2691E',
    padding: 15,
    borderRadius: 30,
    width: '60%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#D2691E',
    padding: 15,
    borderRadius: 30,
    marginVertical: 10,
    width: '60%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Poppins',
  },
  scoreText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Poppins',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 10,
    marginBottom: 15,
  },
  score: {
    fontSize: 24,
    color: '#333',
    fontFamily: 'Poppins',
    marginVertical: 10,
  },
  levelScore: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Poppins',
    marginVertical: 5,
  },
  badgesText: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Poppins',
    marginVertical: 10,
  },
  retryMessage: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginVertical: 10,
  },
  congratsText: {
    fontSize: 20,
    color: '#FFD700',
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginVertical: 10,
  },
  loadingText: {
    fontSize: 24,
    color: '#333',
    fontFamily: 'Poppins',
    marginTop: 20,
  },
});

export default AnimalQuizScreen;