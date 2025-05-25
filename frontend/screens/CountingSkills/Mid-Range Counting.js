import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 50;
const FLOWER_CENTER_SIZE = 60;
const MIDDLE_FLOWER_CENTER_SIZE = 60;
const DUSTBIN_SIZE = 50;
const DUSTBIN_PADDING = 20;
const STEM_HEIGHT = height * 0.6;
const LEAF_SIZE = 30;
const FLOWER_POSITIONS = [
    { x: width * 0.25, y: height * 0.3 },
    { x: width * 0.5, y: height * 0.3 },
    { x: width * 0.75, y: height * 0.3 },
];

// Memoized DraggableElement component to prevent unnecessary re-renders
const DraggableElement = memo(({ id, x, y, flowerIndex, onDrop, label }) => {
    const pan = useRef(new Animated.ValueXY({ x, y })).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Only run entrance animations on first render
        if (isFirstRender.current) {
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(bounceAnim, {
                        toValue: 1.2,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.spring(bounceAnim, {
                        toValue: 1,
                        friction: 3,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
            isFirstRender.current = false;
        }
    }, []);

    // Optimize position updates using useEffect with dependencies
    useEffect(() => {
        if (!isFirstRender.current) {
            Animated.spring(pan, {
                toValue: { x, y },
                useNativeDriver: false,
                friction: 5, // Increased friction for smoother animation
            }).start();
        }
    }, [x, y]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({ x: pan.x._value, y: pan.y._value });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (evt, gestureState) => {
                pan.flattenOffset();
                onDrop(flowerIndex, id, gestureState.dx, gestureState.dy);
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.bounceWrapper,
                { transform: [{ scale: bounceAnim }], opacity: fadeAnim },
            ]}
        >
            <Animated.View
                style={[styles.petal, { transform: pan.getTranslateTransform() }]}
                {...panResponder.panHandlers}
            >
                <Text style={styles.labelText}>{label}</Text>
            </Animated.View>
        </Animated.View>
    );
}, (prevProps, nextProps) => {
    // Custom equality check for memoization
    return (
        prevProps.id === nextProps.id &&
        prevProps.label === nextProps.label &&
        Math.abs(prevProps.x - nextProps.x) < 1 &&
        Math.abs(prevProps.y - nextProps.y) < 1 &&
        prevProps.flowerIndex === nextProps.flowerIndex
    );
});

// Memoized Flower component to reduce re-renders
const Flower = memo(({ flower, flowerIndex, onDrop, pulseAnim }) => {
    return (
        <React.Fragment>
            <Animated.View
                style={[
                    styles.flowerCenter,
                    {
                        left: flower.x - (flowerIndex === 1 ? MIDDLE_FLOWER_CENTER_SIZE / 2 : FLOWER_CENTER_SIZE / 2),
                        top: flower.y - (flowerIndex === 1 ? MIDDLE_FLOWER_CENTER_SIZE / 2 : FLOWER_CENTER_SIZE / 2),
                        width: flowerIndex === 1 ? MIDDLE_FLOWER_CENTER_SIZE : FLOWER_CENTER_SIZE,
                        height: flowerIndex === 1 ? MIDDLE_FLOWER_CENTER_SIZE : FLOWER_CENTER_SIZE,
                        borderRadius: flowerIndex === 1 ? MIDDLE_FLOWER_CENTER_SIZE / 2 : FLOWER_CENTER_SIZE / 2,
                        transform: [{ scale: pulseAnim || 1 }],
                    },
                ]}
            />
            <View
                style={[
                    styles.stem,
                    {
                        left: flower.x - 2,
                        top: flower.y + (flowerIndex === 1 ? MIDDLE_FLOWER_CENTER_SIZE / 2 : FLOWER_CENTER_SIZE / 2),
                        height: STEM_HEIGHT,
                    },
                ]}
            />
            {/* Left leaf */}
            <View
                style={[
                    styles.leafBase,
                    {
                        left: flower.x - LEAF_SIZE - 5,
                        top: flower.y + STEM_HEIGHT * 0.3,
                        transform: [{ rotate: '30deg' }],
                    },
                ]}
            >
                <View style={styles.leafVeins} />
                <View style={[styles.leafVein, { transform: [{ rotate: '20deg' }] }]} />
                <View style={[styles.leafVein, { transform: [{ rotate: '40deg' }] }]} />
                <View style={[styles.leafVein, { transform: [{ rotate: '-20deg' }] }]} />
                <View style={[styles.leafVein, { transform: [{ rotate: '-40deg' }] }]} />
            </View>
            
            {/* Right leaf */}
            <View
                style={[
                    styles.leafBase,
                    {
                        left: flower.x + 5,
                        top: flower.y + STEM_HEIGHT * 0.5,
                        transform: [{ rotate: '-30deg' }, { scaleX: -1 }],
                    },
                ]}
            >
                <View style={styles.leafVeins} />
                <View style={[styles.leafVein, { transform: [{ rotate: '20deg' }] }]} />
                <View style={[styles.leafVein, { transform: [{ rotate: '40deg' }] }]} />
                <View style={[styles.leafVein, { transform: [{ rotate: '-20deg' }] }]} />
                <View style={[styles.leafVein, { transform: [{ rotate: '-40deg' }] }]} />
            </View>

            {flower.petals.map((petal) => (
                <DraggableElement
                    key={petal.id}
                    id={petal.id}
                    flowerIndex={flower.flowerIndex}
                    x={petal.x}
                    y={petal.y}
                    label={petal.label}
                    onDrop={onDrop}
                />
            ))}
        </React.Fragment>
    );
});

// Cached flower generator
const generateFlowers = () => {
    return FLOWER_POSITIONS.map((pos, flowerIndex) => {
        const petalCount = Math.floor(Math.random() * 6) + 5;
        const petals = Array.from({ length: petalCount }, (_, i) => {
            const angle = (i / petalCount) * 2 * Math.PI;
            const radius = 40;
            return {
                id: `${flowerIndex}-${i}`,
                label: i + 1,
                x: pos.x + Math.cos(angle) * radius - ELEMENT_SIZE / 2,
                y: pos.y + Math.sin(angle) * radius - ELEMENT_SIZE / 2,
                flowerIndex,
            };
        });
        return { flowerIndex, x: pos.x, y: pos.y, petals };
    });
};

// Background component to prevent main component re-renders
const Background = memo(() => {
    const cloudDrift1 = useRef(new Animated.Value(0)).current;
    const cloudDrift2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start cloud animations
        Animated.loop(
            Animated.sequence([
                Animated.timing(cloudDrift1, {
                    toValue: 40,
                    duration: 5000,
                    useNativeDriver: true,
                }),
                Animated.timing(cloudDrift1, {
                    toValue: 0,
                    duration: 5000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
        Animated.loop(
            Animated.sequence([
                Animated.timing(cloudDrift2, {
                    toValue: -40,
                    duration: 6000,
                    useNativeDriver: true,
                }),
                Animated.timing(cloudDrift2, {
                    toValue: 0,
                    duration: 6000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <>
            <View style={styles.skyBackground} />
            <View style={styles.grassBackground} />
            <View style={styles.sunBackground} />
            <Animated.View
                style={[
                    styles.cloudBackground1,
                    { transform: [{ translateX: cloudDrift1 }] },
                ]}
            />
            <Animated.View
                style={[
                    styles.cloudBackground2,
                    { transform: [{ translateX: cloudDrift2 }] },
                ]}
            />
            <View style={styles.flowerBackground1} />
            <View style={styles.flowerBackground2} />
        </>
    );
});

const MidrangeCounting = () => {
    const [flowers, setFlowers] = useState([]);
    const pulseAnim = useRef([]).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const animationTimeouts = useRef([]);
    const navigation = useNavigation();

    // Clear all animation timeouts when unmounting
    useEffect(() => {
        return () => {
            animationTimeouts.current.forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            setFlowers(generateFlowers());
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, [])
    );

    // Initialize pulse animations only when flowers change
    useEffect(() => {
        // Clear previous animations to prevent memory leaks
        pulseAnim.forEach((anim) => anim?.stopAnimation());
        pulseAnim.length = 0;

        // Use requestAnimationFrame to reduce jank
        const requestId = requestAnimationFrame(() => {
            flowers.forEach(() => {
                const anim = new Animated.Value(1);
                pulseAnim.push(anim);
                
                // Use less aggressive pulsing
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: 1.05, // Reduce the pulse magnitude
                            duration: 1500, // Slow down the pulse
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 1500,
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
            });
        });

        return () => cancelAnimationFrame(requestId);
    }, [flowers.length]); // Only depend on flower count, not the entire flowers array

    // Memoized drop handler to prevent recreation on each render
    const handleDrop = useCallback((flowerIndex, id, deltaX, deltaY) => {
        setFlowers((prevFlowers) => {
            const updatedFlowers = [...prevFlowers];
            const sourceFlowerIndex = updatedFlowers.findIndex(f => f.flowerIndex === flowerIndex);
            
            if (sourceFlowerIndex === -1) return prevFlowers;
            
            const sourceFlower = updatedFlowers[sourceFlowerIndex];
            const petalIndex = sourceFlower.petals.findIndex(p => p.id === id);
            
            if (petalIndex === -1) return prevFlowers;
            
            const petal = sourceFlower.petals[petalIndex];
            const currentX = petal.x + deltaX;
            const currentY = petal.y + deltaY;
            const dustbinX = width - DUSTBIN_SIZE - DUSTBIN_PADDING;
            const dustbinY = DUSTBIN_PADDING;

            const isInDustbin =
                currentX + ELEMENT_SIZE >= dustbinX - 10 &&
                currentX <= dustbinX + DUSTBIN_SIZE + 10 &&
                currentY + ELEMENT_SIZE >= dustbinY - 10 &&
                currentY <= dustbinY + DUSTBIN_SIZE + 10;

            if (isInDustbin) {
                // Remove petal if dropped in dustbin
                const updatedPetals = sourceFlower.petals.filter((p) => p.id !== id);
                updatedFlowers[sourceFlowerIndex] = { ...sourceFlower, petals: updatedPetals };
                return updatedFlowers;
            }

            // Check if petal is near another flower center
            let targetFlowerIndex = -1;
            for (let i = 0; i < updatedFlowers.length; i++) {
                const flower = updatedFlowers[i];
                if (flower.flowerIndex === flowerIndex) continue;
                
                const distance = Math.sqrt(
                    Math.pow(currentX - flower.x, 2) + Math.pow(currentY - flower.y, 2)
                );
                
                if (distance < 60) {
                    targetFlowerIndex = i;
                    break;
                }
            }

            if (targetFlowerIndex !== -1) {
                // Move petal to target flower
                const targetFlower = updatedFlowers[targetFlowerIndex];
                const newPetal = { ...petal, flowerIndex: targetFlower.flowerIndex };
                
                // Remove from source flower
                updatedFlowers[sourceFlowerIndex] = {
                    ...sourceFlower,
                    petals: sourceFlower.petals.filter(p => p.id !== id)
                };
                
                // Add to target flower and rearrange all petals
                const newTargetPetals = [...targetFlower.petals, newPetal];
                updatedFlowers[targetFlowerIndex] = {
                    ...targetFlower,
                    petals: newTargetPetals.map((p, i) => {
                        const angle = (i / newTargetPetals.length) * 2 * Math.PI;
                        const radius = 40;
                        return {
                            ...p,
                            x: targetFlower.x + Math.cos(angle) * radius - ELEMENT_SIZE / 2,
                            y: targetFlower.y + Math.sin(angle) * radius - ELEMENT_SIZE / 2,
                            label: i + 1,
                        };
                    })
                };
            } else {
                // Reset petal position
                updatedFlowers[sourceFlowerIndex] = {
                    ...sourceFlower,
                    petals: sourceFlower.petals.map((p, i) => {
                        if (p.id !== id) return p;
                        
                        const angle = (i / sourceFlower.petals.length) * 2 * Math.PI;
                        const radius = 40;
                        return {
                            ...p,
                            x: sourceFlower.x + Math.cos(angle) * radius - ELEMENT_SIZE / 2,
                            y: sourceFlower.y + Math.sin(angle) * radius - ELEMENT_SIZE / 2,
                        };
                    })
                };
            }
            
            return updatedFlowers;
        });
    }, []);

    const addPetal = useCallback(() => {
        // Remove flag entirely for instant response
        setFlowers(prevFlowers => {
            // Find the flower with the minimum petal count that has less than 10 petals
            let minPetalIndex = 0;
            let minPetalCount = prevFlowers[0].petals.length;
            
            for (let i = 1; i < prevFlowers.length; i++) {
                if (prevFlowers[i].petals.length < minPetalCount) {
                    minPetalCount = prevFlowers[i].petals.length;
                    minPetalIndex = i;
                }
            }
            
            // If all flowers have 10 petals, do nothing
            if (minPetalCount >= 10) {
                return prevFlowers;
            }
            
            // Create updated flowers array
            const updatedFlowers = [...prevFlowers];
            const flower = updatedFlowers[minPetalIndex];
            
            const newPetal = {
                id: `${flower.flowerIndex}-${Date.now()}-${Math.random()}`, // More unique ID
                flowerIndex: flower.flowerIndex,
            };
            
            const newPetals = [...flower.petals, newPetal];
            updatedFlowers[minPetalIndex] = {
                ...flower,
                petals: newPetals.map((p, i) => {
                    const angle = (i / newPetals.length) * 2 * Math.PI;
                    const radius = 40;
                    return {
                        ...p,
                        x: flower.x + Math.cos(angle) * radius - ELEMENT_SIZE / 2,
                        y: flower.y + Math.sin(angle) * radius - ELEMENT_SIZE / 2,
                        label: i + 1,
                    };
                })
            };
            
            return updatedFlowers;
        });
    }, []);

    const resetFlowers = useCallback(() => {
        // Remove flag entirely for instant response
        setFlowers(generateFlowers());
    }, []);

    // Clean-up effect to stop all pulses & timeouts
    useEffect(() => {
        return () => {
            // stop any running pulse animations
            pulseAnim.forEach(anim => anim.stopAnimation());
            // clear any lingering timeouts
            animationTimeouts.current.forEach(id => clearTimeout(id));
        };
    }, []);

    // Back-button handler
    const handleBack = useCallback(() => {
        // ensure all animations stop immediately
        pulseAnim.forEach(anim => anim.stopAnimation());
        animationTimeouts.current.forEach(id => clearTimeout(id));
        // now navigate away
        navigation.navigate('SmartCounter');
    }, [navigation]);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Background is memoized to prevent re-renders */}
            <Background />
            
            <View style={styles.workspace}>
                {flowers.map((flower, index) => (
                    <Flower 
                        key={flower.flowerIndex}
                        flower={flower}
                        flowerIndex={flower.flowerIndex}
                        onDrop={handleDrop}
                        pulseAnim={pulseAnim[index]}
                    />
                ))}
            </View>
            
            <View style={styles.dustbin}>
                <Text style={styles.dustbinText}>🗑️</Text>
            </View>
            
            <TouchableOpacity 
                onPress={addPetal} 
                activeOpacity={0.6}
                delayPressIn={0}
                delayPressOut={0}
                delayLongPress={0}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} // Increase touch area
                style={styles.addButton}
            >
                <Text style={styles.buttonText}>Add Petal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={resetFlowers} 
                activeOpacity={0.6}
                delayPressIn={0}
                delayPressOut={0}
                delayLongPress={0}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} // Increase touch area
                style={styles.resetButton}
            >
                <Text style={styles.resetButtonText}>↻</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={handleBack} 
                activeOpacity={0.6}
                delayPressIn={0}
                delayPressOut={0}
                delayLongPress={0}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} // Increase touch area
                style={styles.backButton}
            >
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    skyBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height * 0.6,
        backgroundColor: '#87CEEB',
    },
    grassBackground: {
        position: 'absolute',
        top: height * 0.6,
        left: 0,
        width: width,
        height: height * 0.4,
        backgroundColor: '#90EE90',
    },
    sunBackground: {
        position: 'absolute',
        top: 40,
        right: 40,
        width: 80,
        height: 80,
        backgroundColor: '#FFFF00',
        borderRadius: 40,
        shadowColor: '#FFA500',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 5,
    },
    cloudBackground1: {
        position: 'absolute',
        top: 100,
        left: 60,
        width: 100,
        height: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    cloudBackground2: {
        position: 'absolute',
        top: 140,
        right: 80,
        width: 120,
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    flowerBackground1: {
        position: 'absolute',
        bottom: 60,
        left: 20,
        width: 30,
        height: 30,
        backgroundColor: '#FFD700',
        borderRadius: 15,
    },
    flowerBackground2: {
        position: 'absolute',
        bottom: 80,
        right: 30,
        width: 25,
        height: 25,
        backgroundColor: '#FF4500',
        borderRadius: 12.5,
    },
    workspace: {
        flex: 1,
    },
    flowerCenter: {
        backgroundColor: '#FFD700',
        position: 'absolute',
        zIndex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    stem: {
        width: 4,
        backgroundColor: '#228B22',
        position: 'absolute',
        zIndex: 0,
    },
    leafBase: {
        width: LEAF_SIZE * 1.5,
        height: LEAF_SIZE * 0.8,
        backgroundColor: '#32CD32',
        borderRadius: LEAF_SIZE * 0.5,
        position: 'absolute',
        zIndex: 0,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 2,
        elevation: 3,
    },
    leafVeins: {
        position: 'absolute',
        width: 2,
        height: LEAF_SIZE * 0.7,
        backgroundColor: '#1E8449',
        left: LEAF_SIZE * 0.7,
        top: LEAF_SIZE * 0.05,
    },
    leafVein: {
        position: 'absolute',
        width: 1,
        height: LEAF_SIZE * 0.4,
        backgroundColor: '#1E8449',
        left: LEAF_SIZE * 0.7,
        top: LEAF_SIZE * 0.2,
    },
    bounceWrapper: {
        position: 'absolute',
    },
    petal: {
        width: ELEMENT_SIZE,
        height: ELEMENT_SIZE,
        backgroundColor: '#FF69B4',
        borderRadius: ELEMENT_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 10,
        zIndex: 2,
        // Ensure the petal itself is not clipping the text
        overflow: 'visible',
    },
    labelText: {
        color: '#FFFFFF', // Keep white for contrast against pink background
        fontSize: 18, // Slightly larger for better visibility
        fontWeight: 'bold',
        textAlign: 'center',
        // Add a slight background to improve contrast
        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Semi-transparent black background
        borderRadius: 5,
        padding: 2,
        // Ensure the text is on top
        zIndex: 3,
        // Prevent text from being cut off
        overflow: 'visible',
    },
    dustbin: {
        position: 'absolute',
        top: DUSTBIN_PADDING,
        right: DUSTBIN_PADDING,
        width: DUSTBIN_SIZE,
        height: DUSTBIN_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: DUSTBIN_SIZE / 2,
        borderWidth: 2,
        borderColor: '#FF4444',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    dustbinText: {
        fontSize: 30,
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: '#4169E1',
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        fontSize: 20,
        color: 'white',
        fontWeight: '600',
    },
    resetButton: {
        position: 'absolute',
        bottom: DUSTBIN_PADDING,
        right: DUSTBIN_PADDING,
        width: 50,
        height: 50,
        backgroundColor: '#4169E1',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    resetButtonText: {
        fontSize: 30,
        color: 'white',
    },
    backButton: {
        position: 'absolute',
        top: DUSTBIN_PADDING,
        left: DUSTBIN_PADDING,
        backgroundColor: '#00BFFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    backButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
    },
});

export default MidrangeCounting;