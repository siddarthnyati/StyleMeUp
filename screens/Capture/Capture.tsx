/**
 * @register Sanctuary
 * @design-ref DESIGN.md §1.5, §10 (Capture), §12
 *
 * Phase A: real capture. Native uses expo-camera CameraView; web falls back
 * to a file picker. The photo is downscaled to ~768px (kept with a base64
 * for the Phase B/C classifier) and previewed before saving to the closet.
 * Classification (kind/label/colour) arrives in Phase C — for now the saved
 * piece carries the real photo with a placeholder label.
 */
import { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, sizing, spacing, type } from '@/tokens';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';
import { useFirstWeekStore } from '@/lib/firstWeek';

type CaptureStage = 'preface' | 'viewfinder' | 'preview';
type CapturedImage = { uri: string; base64?: string };

const isWeb = Platform.OS === 'web';
const TARGET_WIDTH = 768;

export function Capture() {
  const saveCapturedPiece = useFirstWeekStore((state) => state.saveCapturedPiece);
  const [stage, setStage] = useState<CaptureStage>('preface');
  const [captured, setCaptured] = useState<CapturedImage | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleOpenCamera() {
    if (isWeb) {
      fileInputRef.current?.click();
      return;
    }

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        return;
      }
    }

    setStage('viewfinder');
  }

  async function handleShutter() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (!photo?.uri) {
      return;
    }

    const resized = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: TARGET_WIDTH } }],
      { compress: 0.8, base64: true, format: ImageManipulator.SaveFormat.JPEG },
    );

    setCaptured({ uri: resized.uri, base64: resized.base64 });
    setStage('preview');
  }

  function handleWebFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : undefined;
      setCaptured({ uri: dataUrl, base64 });
      setStage('preview');
    };
    reader.readAsDataURL(file);

    // Allow re-selecting the same file later.
    event.target.value = '';
  }

  function handleRetake() {
    setCaptured(null);
    setStage(isWeb ? 'preface' : 'viewfinder');
  }

  function handleSave() {
    if (captured?.uri) {
      saveCapturedPiece({ imageUri: captured.uri });
    }
    setCaptured(null);
    setStage('preface');
    router.push('/closet');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {isWeb ? (
        <input
          accept="image/*"
          onChange={handleWebFile}
          ref={fileInputRef}
          style={{ display: 'none' }}
          type="file"
        />
      ) : null}

      <View style={[styles.stage, stage === 'viewfinder' && styles.stageInk]}>
        {stage === 'preface' ? (
          <View style={styles.preface}>
            <View style={styles.prefaceHeader}>
              <Text style={styles.sanctuaryEyebrow}>capture</Text>
              <Text style={styles.prefaceHeadline}>one piece.</Text>
              <Text style={styles.prefaceSubcaption}>start with the one nearest you.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={handleOpenCamera}
              style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
            >
              <Text style={styles.primaryActionLabel}>OPEN CAMERA</Text>
            </Pressable>
          </View>
        ) : null}

        {stage === 'viewfinder' && !isWeb ? (
          <>
            <View style={styles.topBar}>
              <Pressable accessibilityRole="button" onPress={() => setStage('preface')} style={styles.topAction}>
                <Text style={styles.cancel}>← cancel</Text>
              </Pressable>
              <Text style={styles.eyebrow}>FRAME THE PIECE</Text>
              <View style={styles.topSpacer} />
            </View>

            <CameraView facing="back" ref={cameraRef} style={styles.camera} />

            <View style={styles.shutterWrap}>
              <Pressable
                accessibilityLabel="capture one piece"
                accessibilityRole="button"
                onPress={handleShutter}
                style={({ pressed }) => [styles.shutterButton, pressed && styles.pressed]}
              >
                <View style={styles.shutter} />
              </Pressable>
            </View>
          </>
        ) : null}

        {stage === 'preview' ? (
          <View style={styles.previewStage}>
            <View style={styles.previewTop}>
              <Pressable accessibilityRole="button" onPress={handleRetake} style={styles.topAction}>
                <Text style={styles.previewAction}>← retake</Text>
              </Pressable>
              <Text style={styles.sanctuaryEyebrow}>JUST CAPTURED</Text>
              <View style={styles.topSpacer} />
            </View>

            {captured?.uri ? (
              <Image accessibilityIgnoresInvertColors contentFit="cover" source={{ uri: captured.uri }} style={styles.previewPhoto} transition={400} />
            ) : (
              <View style={styles.previewPhoto} />
            )}

            <View style={styles.previewActions}>
              <Pressable
                accessibilityRole="button"
                onPress={handleSave}
                style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
              >
                <Text style={styles.primaryActionLabel}>SAVE TO CLOSET</Text>
              </Pressable>
              <Link href="/closet" asChild>
                <Pressable accessibilityRole="button" style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}>
                  <Text style={styles.textActionLabel}>not now</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        ) : null}
      </View>
      <BottomNavigation active="capture" register="Sanctuary" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  stage: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  stageInk: {
    backgroundColor: colors.ink,
  },
  preface: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[7],
    paddingBottom: spacing[6],
  },
  prefaceHeader: {
    gap: spacing[2],
  },
  sanctuaryEyebrow: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
  },
  prefaceHeadline: {
    color: colors.ink,
    fontFamily: type.families.displayMagazine,
    fontSize: type.displayMd.size,
    fontStyle: 'italic',
    fontWeight: type.displayMd.weight,
    lineHeight: type.displayMd.lineHeight,
  },
  prefaceSubcaption: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  topBar: {
    minHeight: sizing.tapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
  },
  topAction: {
    minWidth: sizing.tapTarget,
    minHeight: sizing.tapTarget,
    justifyContent: 'center',
  },
  cancel: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
    opacity: 0.7,
  },
  eyebrow: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
    opacity: 0.85,
  },
  topSpacer: {
    width: sizing.tapTarget,
  },
  camera: {
    flex: 1,
    borderColor: colors.smoke[500],
    borderTopWidth: sizing.hairline,
    borderBottomWidth: sizing.hairline,
  },
  shutterWrap: {
    minHeight: sizing.captureControlHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterButton: {
    width: sizing.tapTarget,
    height: sizing.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: sizing.captureShutter,
    height: sizing.captureShutter,
    borderColor: colors.paper,
    borderRadius: radius.pill,
    borderWidth: sizing.captureShutterRing,
    backgroundColor: colors.power,
  },
  previewStage: {
    flex: 1,
    gap: spacing[5],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[6],
  },
  previewTop: {
    minHeight: sizing.tapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewAction: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  previewPhoto: {
    flex: 1,
    borderRadius: radius.none,
    backgroundColor: colors.bone,
  },
  previewActions: {
    gap: spacing[2],
  },
  primaryAction: {
    minHeight: sizing.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing[5],
  },
  primaryActionLabel: {
    color: colors.paper,
    fontFamily: type.families.body,
    fontSize: type.label.size,
    fontWeight: type.label.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.label.lineHeight,
  },
  textAction: {
    minHeight: sizing.tapTarget,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  textActionLabel: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.headlineMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  pressed: {
    opacity: 0.64,
  },
});
