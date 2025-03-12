import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 40;
const FLOWER_CENTER_SIZE = 50;
const MIDDLE_FLOWER_CENTER_SIZE = 70;
const DUSTBIN_SIZE = 50;
const DUSTBIN_PADDING = 20;
const STEM_HEIGHT = height * 0.6;
const LEAF_SIZE = 30;
const FLOWER_POSITIONS = [
    { x: width * 0.25, y: height * 0.3 },
    { x: width * 0.5, y: height * 0.3 },
    { x: width * 0.75, y: height * 0.3 },
];

const DraggableElement = ({ id, x, y, flowerIndex, onDrop, label }) => {
    const pan = useRef(new Animated.ValueXY({ x, y })).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
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

        Animated.spring(pan, {
            toValue: { x, y },
            useNativeDriver: false,
        }).start();
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
};

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

const MidrangeCounting = () => {
    const [flowers, setFlowers] = useState([]);
    const pulseAnim = useRef([]).current;
    const cloudDrift1 = useRef(new Animated.Value(0)).current; // Start at 0 for translateX
    const cloudDrift2 = useRef(new Animated.Value(0)).current; // Start at 0 for translateX
    const addButtonScale = useRef(new Animated.Value(1)).current;
    const resetButtonScale = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        React.useCallback(() => {
            setFlowers(generateFlowers());
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, [])
    );

    // Separate useEffect for cloud animations (runs once on mount)
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(cloudDrift1, {
                    toValue: 40, // Move right by 40
                    duration: 5000,
                    useNativeDriver: true,
                }),
                Animated.timing(cloudDrift1, {
                    toValue: 0, // Back to starting position
                    duration: 5000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
        Animated.loop(
            Animated.sequence([
                Animated.timing(cloudDrift2, {
                    toValue: -40, // Move left by 40 (negative for right-aligned cloud)
                    duration: 6000,
                    useNativeDriver: true,
                }),
                Animated.timing(cloudDrift2, {
                    toValue: 0, // Back to starting position
                    duration: 6000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []); // Empty dependency array ensures it runs only once on mount

    // Separate useEffect for flower pulse animations
    useEffect(() => {
        pulseAnim.forEach((anim) => anim.stopAnimation());
        pulseAnim.length = 0;

        flowers.forEach(() => {
            const anim = new Animated.Value(1);
            pulseAnim.push(anim);
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        });
    }, [flowers]);

    const handleDrop = (flowerIndex, id, deltaX, deltaY) => {
        setFlowers((prevFlowers) =>
            prevFlowers.map((f) => {
                if (f.flowerIndex !== flowerIndex) return f;

                const petal = f.petals.find((p) => p.id === id);
                if (!petal) return f;

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
                    const updatedPetals = f.petals.filter((p) => p.id !== id);
                    return { ...f, petals: updatedPetals };
                }

                let targetFlower = null;
                for (const flower of prevFlowers) {
                    const distance = Math.sqrt(
                        Math.pow(currentX - flower.x, 2) + Math.pow(currentY - flower.y, 2)
                    );
                    if (distance < 60 && flower.flowerIndex !== flowerIndex) {
                        targetFlower = flower;
                        break;
                    }
                }

                if (targetFlower) {
                    const updatedPetals = f.petals.filter((p) => p.id !== id);
                    const newPetal = { ...petal, flowerIndex: targetFlower.flowerIndex };
                    const newTargetPetals = [...targetFlower.petals, newPetal];
                    const updatedTargetPetals = newTargetPetals.map((p, i) => {
                        const angle = (i / newTargetPetals.length) * 2 * Math.PI;
                        const radius = 40;
                        return {
                            ...p,
                            x: targetFlower.x + Math.cos(angle) * radius - ELEMENT_SIZE / 2,
                            y: targetFlower.y + Math.sin(angle) * radius - ELEMENT_SIZE / 2,
                        };
                    });
                    return f.flowerIndex === targetFlower.flowerIndex
                        ? { ...f, petals: updatedTargetPetals }
                        : { ...f, petals: updatedPetals };
                } else {
                    const updatedPetals = f.petals.map((p, i) => {
                        if (p.id !== id) return p;
                        const angle = (i / f.petals.length) * 2 * Math.PI;
                        const radius = 40;
                        return {
                            ...p,
                            x: f.x + Math.cos(angle) * radius - ELEMENT_SIZE / 2,
                            y: f.y + Math.sin(angle) * radius - ELEMENT_SIZE / 2,
                        };
                    });
                    return { ...f, petals: updatedPetals };
                }
            })
        );
    };

    const addPetal = () => {
        Animated.sequence([
            Animated.timing(addButtonScale, {
                toValue: 1.1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(addButtonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        const randomFlowerIndex = Math.floor(Math.random() * flowers.length);
        setFlowers((prevFlowers) =>
            prevFlowers.map((f) => {
                if (f.flowerIndex !== randomFlowerIndex) return f;
                if (f.petals.length >= 10) return f;

                const newPetal = {
                    id: `${f.flowerIndex}-${Date.now()}`,
                    flowerIndex: f.flowerIndex,
                };
                const newPetals = [...f.petals, newPetal];
                const updatedPetals = newPetals.map((p, i) => {
                    const angle = (i / newPetals.length) * 2 * Math.PI;
                    const radius = 40;
                    return {
                        ...p,
                        x: f.x + Math.cos(angle) * radius - ELEMENT_SIZE / 2,
                        y: f.y + Math.sin(angle) * radius - ELEMENT_SIZE / 2,
                        label: i + 1,
                    };
                });
                return { ...f, petals: updatedPetals };
            })
        );
    };

    const resetFlowers = () => {
        Animated.sequence([
            Animated.timing(resetButtonScale, {
                toValue: 1.1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(resetButtonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        setFlowers(generateFlowers());
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
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

            <View style={styles.workspace}>
                {flowers.map((flower, index) => (
                    <React.Fragment key={flower.flowerIndex}>
                        <Animated.View
                            style={[
                                styles.flowerCenter,
                                {
                                    left: flower.x - (flower.flowerIndex === 1 ? MIDDLE_FLOWER_CENTER_SIZE / 2 : FLOWER_CENTER_SIZE / 2),
                                    top: flower.y - (flower.flowerIndex === 1 ? MIDDLE_FLOWER_CENTER_SIZE / 2 : FLOWER_CENTER_SIZE / 2),
                                    width: flower.flowerIndex === 1 ? MIDDLE_FLOWER_CENTER_SIZE : FLOWER_CENTER_SIZE,
                                    height: flower.flowerIndex === 1 ? MIDDLE_FLOWER_CENTER_SIZE : FLOWER_CENTER_SIZE,
                                    borderRadius: flower.flowerIndex === 1 ? MIDDLE_FLOWER_CENTER_SIZE / 2 : FLOWER_CENTER_SIZE / 2,
                                    transform: [{ scale: pulseAnim[index] || 1 }],
                                },
                            ]}
                        />
                        <View
                            style={[
                                styles.stem,
                                {
                                    left: flower.x - 2,
                                    top: flower.y + (flower.flowerIndex === 1 ? MIDDLE_FLOWER_CENTER_SIZE / 2 : FLOWER_CENTER_SIZE / 2),
                                    height: STEM_HEIGHT,
                                },
                            ]}
                        />
                        <View
                            style={[
                                styles.leaf,
                                {
                                    left: flower.x - LEAF_SIZE - 5,
                                    top: flower.y + STEM_HEIGHT * 0.4,
                                    transform: [{ rotate: '45deg' }],
                                },
                            ]}
                        />
                        <View
                            style={[
                                styles.leaf,
                                {
                                    left: flower.x + 5,
                                    top: flower.y + STEM_HEIGHT * 0.4,
                                    transform: [{ rotate: '-45deg' }],
                                },
                            ]}
                        />
                        {flower.petals.map((petal) => (
                            <DraggableElement
                                key={petal.id}
                                id={petal.id}
                                flowerIndex={flower.flowerIndex}
                                x={petal.x}
                                y={petal.y}
                                label={petal.label}
                                onDrop={handleDrop}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </View>
            <View style={styles.dustbin}>
                <Text style={styles.dustbinText}>🗑️</Text>
            </View>
            <TouchableOpacity onPress={addPetal}>
                <Animated.View style={[styles.addButton, { transform: [{ scale: addButtonScale }] }]}>
                    <Text style={styles.buttonText}>Add Petal</Text>
                </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity onPress={resetFlowers}>
                <Animated.View style={[styles.resetButton, { transform: [{ scale: resetButtonScale }] }]}>
                    <Text style={styles.resetButtonText}>↻</Text>
                </Animated.View>
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
        left: 60, // Static initial position
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
        right: 80, // Static initial position
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
    leaf: {
        width: LEAF_SIZE,
        height: LEAF_SIZE,
        backgroundColor: '#228B22',
        borderRadius: LEAF_SIZE / 2,
        position: 'absolute',
        zIndex: 0,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 3,
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
    },
    labelText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
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
});

export default MidrangeCounting;