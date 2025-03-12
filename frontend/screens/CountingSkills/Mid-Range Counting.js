import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const ELEMENT_SIZE = 40; // Smaller size for petals
const FLOWER_CENTER_SIZE = 50; // Size of the flower's center
const DUSTBIN_SIZE = 50;
const DUSTBIN_PADDING = 20;
const FLOWER_POSITIONS = [
    { x: width * 0.25, y: height * 0.4 }, // Left flower
    { x: width * 0.5, y: height * 0.4 },  // Middle flower
    { x: width * 0.75, y: height * 0.4 }, // Right flower
];

const DraggableElement = ({ id, x, y, flowerIndex, onDrop, label }) => {
    const pan = useRef(new Animated.ValueXY({ x, y })).current;

    useEffect(() => {
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
            style={[styles.petal, { transform: pan.getTranslateTransform() }]}
            {...panResponder.panHandlers}
        >
            <Text style={styles.labelText}>{label}</Text>
        </Animated.View>
    );
};

const generateFlowers = () => {
    return FLOWER_POSITIONS.map((pos, flowerIndex) => {
        const petalCount = Math.floor(Math.random() * 5) + 3; // Random petals (3 to 7)
        const petals = Array.from({ length: petalCount }, (_, i) => {
            const angle = (i / petalCount) * 2 * Math.PI; // Distribute petals in a circle
            const radius = 40; // Distance from center
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
    const [flowers, setFlowers] = useState([]); // Initially empty

    useFocusEffect(
        React.useCallback(() => {
            setFlowers(generateFlowers()); // Reset flowers on focus
        }, [])
    );

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

                // Check if dropped in dustbin
                const isInDustbin =
                    currentX + ELEMENT_SIZE > dustbinX &&
                    currentX < dustbinX + DUSTBIN_SIZE &&
                    currentY + ELEMENT_SIZE > dustbinY &&
                    currentY < dustbinY + DUSTBIN_SIZE;

                if (isInDustbin) {
                    const updatedPetals = f.petals.filter((p) => p.id !== id);
                    return { ...f, petals: updatedPetals };
                }

                // Check if dropped near another flower
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
                    // Recalculate positions for the target flower
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
                }

                return f;
            })
        );
    };

    const addPetal = () => {
        const randomFlowerIndex = Math.floor(Math.random() * flowers.length);
        setFlowers((prevFlowers) =>
            prevFlowers.map((f) => {
                if (f.flowerIndex !== randomFlowerIndex) return f;
                const newPetal = {
                    id: `${f.flowerIndex}-${Date.now()}`,
                    flowerIndex: f.flowerIndex,
                };
                const newPetals = [...f.petals, newPetal];
                // Recalculate positions for the petals
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
        setFlowers(generateFlowers()); // Reset flowers
    };

    return (
        <View style={styles.container}>
            <View style={styles.workspace}>
                {flowers.map((flower) => (
                    <React.Fragment key={flower.flowerIndex}>
                        {/* Flower center */}
                        <View
                            style={[
                                styles.flowerCenter,
                                { left: flower.x - FLOWER_CENTER_SIZE / 2, top: flower.y - FLOWER_CENTER_SIZE / 2 },
                            ]}
                        />
                        {/* Flower stem */}
                        <View
                            style={[
                                styles.stem,
                                {
                                    left: flower.x - 2,
                                    top: flower.y + FLOWER_CENTER_SIZE / 2,
                                    height: height * 0.5 - flower.y,
                                },
                            ]}
                        />
                        {/* Petals */}
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
            <TouchableOpacity onPress={addPetal} style={styles.addButton}>
                <Text style={styles.buttonText}>Add Petal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resetFlowers} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>↻</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#24bbed',
    },
    workspace: {
        flex: 1,
    },
    flowerCenter: {
        width: FLOWER_CENTER_SIZE,
        height: FLOWER_CENTER_SIZE,
        backgroundColor: 'red',
        borderRadius: FLOWER_CENTER_SIZE / 2,
        position: 'absolute',
        zIndex: 1,
    },
    stem: {
        width: 4,
        backgroundColor: 'green',
        position: 'absolute',
        zIndex: 0,
    },
    petal: {
        width: ELEMENT_SIZE,
        height: ELEMENT_SIZE,
        backgroundColor: 'red',
        borderRadius: ELEMENT_SIZE / 2,
        position: 'absolute',
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
        backgroundColor: '#eee',
        borderRadius: DUSTBIN_SIZE / 2,
        borderWidth: 1,
        borderColor: '#ccc',
        zIndex: 1000,
    },
    dustbinText: {
        fontSize: 30,
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 20,
        color: 'white',
    },
    resetButton: {
        position: 'absolute',
        bottom: DUSTBIN_PADDING,
        right: DUSTBIN_PADDING,
        width: 50,
        height: 50,
        backgroundColor: 'blue',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    resetButtonText: {
        fontSize: 30,
        color: 'white',
    },
});

export default MidrangeCounting;