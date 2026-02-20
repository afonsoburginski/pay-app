import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import { BORDER_RADIUS } from '@/theme/globals';

const SHEET_BG = '#ffffff';
const SHEET_HANDLE = '#d1d5db';
const SHEET_TITLE = '#111827';
import React, { useEffect } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;

type BottomSheetContentProps = {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
  rBottomSheetStyle: Record<string, unknown>;
  onHandlePress?: () => void;
};

const BottomSheetContent = ({
  children,
  title,
  style,
  rBottomSheetStyle,
  onHandlePress,
}: BottomSheetContentProps) => {
  return (
    <Animated.View
      style={[
        {
          height: SCREEN_HEIGHT,
          width: '100%',
          position: 'absolute',
          top: SCREEN_HEIGHT,
          backgroundColor: SHEET_BG,
          borderTopLeftRadius: BORDER_RADIUS,
          borderTopRightRadius: BORDER_RADIUS,
        },
        rBottomSheetStyle,
        style,
      ]}
    >
      <TouchableWithoutFeedback onPress={onHandlePress}>
        <View style={{ width: '100%', paddingVertical: 12, alignItems: 'center' }}>
          <View style={{ width: 64, height: 6, backgroundColor: SHEET_HANDLE, borderRadius: 999 }} />
        </View>
      </TouchableWithoutFeedback>
      {title && (
        <View style={{ marginHorizontal: 16, marginTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: SHEET_TITLE, textAlign: 'center' }}>{title}</Text>
        </View>
      )}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </Animated.View>
  );
};

export type BottomSheetProps = {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
  enableBackdropDismiss?: boolean;
  title?: string;
  style?: ViewStyle;
  disablePanGesture?: boolean;
};

export function BottomSheet({
  isVisible,
  onClose,
  children,
  snapPoints = [0.3, 0.6, 0.9],
  enableBackdropDismiss = true,
  title,
  style,
  disablePanGesture = false,
}: BottomSheetProps) {
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHeight();

  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });
  const opacity = useSharedValue(0);
  const currentSnapIndex = useSharedValue(0);
  const keyboardHeightSV = useSharedValue(0);

  const snapPointsHeights = snapPoints.map((point) => -SCREEN_HEIGHT * point);
  const defaultHeight = snapPointsHeights[0];

  const [modalVisible, setModalVisible] = React.useState(false);

  useEffect(() => {
    if (isVisible) {
      setModalVisible(true);
      translateY.value = withSpring(defaultHeight, { damping: 50, stiffness: 400 });
      opacity.value = withTiming(1, { duration: 300 });
      currentSnapIndex.value = 0;
    } else {
      translateY.value = withSpring(0, { damping: 50, stiffness: 400 });
      opacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(setModalVisible)(false);
      });
    }
  }, [isVisible, defaultHeight]);

  const scrollTo = (destination: number) => {
    'worklet';
    translateY.value = withSpring(destination, { damping: 50, stiffness: 400 });
  };

  useEffect(() => {
    keyboardHeightSV.value = keyboardHeight;
    if (isVisible) {
      const currentSnapHeight = snapPointsHeights[currentSnapIndex.value];
      const destination = isKeyboardVisible ? currentSnapHeight - keyboardHeight : currentSnapHeight;
      scrollTo(destination);
    }
  }, [keyboardHeight, isKeyboardVisible, isVisible]);

  const findClosestSnapPoint = (currentY: number) => {
    'worklet';
    const adjustedY = currentY + keyboardHeightSV.value;
    let closest = snapPointsHeights[0];
    let minDistance = Math.abs(adjustedY - closest);
    let closestIndex = 0;
    for (let i = 0; i < snapPointsHeights.length; i++) {
      const snapPoint = snapPointsHeights[i];
      const distance = Math.abs(adjustedY - snapPoint);
      if (distance < minDistance) {
        minDistance = distance;
        closest = snapPoint;
        closestIndex = i;
      }
    }
    currentSnapIndex.value = closestIndex;
    return closest;
  };

  const handlePress = () => {
    const nextIndex = (currentSnapIndex.value + 1) % snapPointsHeights.length;
    currentSnapIndex.value = nextIndex;
    const destination = snapPointsHeights[nextIndex] - keyboardHeightSV.value;
    scrollTo(destination);
  };

  const animateClose = () => {
    'worklet';
    translateY.value = withSpring(0, { damping: 50, stiffness: 400 });
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newY = context.value.y + event.translationY;
      if (newY <= 0 && newY >= MAX_TRANSLATE_Y) translateY.value = newY;
    })
    .onEnd((event) => {
      const currentY = translateY.value;
      const velocity = event.velocityY;
      if (velocity > 500 && currentY > -SCREEN_HEIGHT * 0.2) {
        animateClose();
        return;
      }
      const closestSnapPoint = findClosestSnapPoint(currentY);
      scrollTo(closestSnapPoint - keyboardHeightSV.value);
    });

  const rBottomSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const rBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleBackdropPress = () => {
    if (enableBackdropDismiss) animateClose();
  };

  return (
    <Modal visible={modalVisible} transparent statusBarTranslucent animationType="none">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }, rBackdropStyle]}>
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <Animated.View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          {disablePanGesture ? (
            <BottomSheetContent
              children={children}
              title={title}
              style={style}
              rBottomSheetStyle={rBottomSheetStyle}
              onHandlePress={() => runOnJS(handlePress)()}
            />
          ) : (
            <GestureDetector gesture={gesture}>
              <BottomSheetContent
                children={children}
                title={title}
                style={style}
                rBottomSheetStyle={rBottomSheetStyle}
                onHandlePress={() => runOnJS(handlePress)()}
              />
            </GestureDetector>
          )}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

export function useBottomSheet() {
  const [isVisible, setIsVisible] = React.useState(false);
  const open = React.useCallback(() => setIsVisible(true), []);
  const close = React.useCallback(() => setIsVisible(false), []);
  const toggle = React.useCallback(() => setIsVisible((prev) => !prev), []);
  return { isVisible, open, close, toggle };
}
