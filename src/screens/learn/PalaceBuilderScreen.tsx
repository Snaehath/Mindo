import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, typography, spacing, radius } from '../../theme';
import { PalaceSpot, UserPalace } from '../../types';

interface TemplateOption {
  type: UserPalace['type'];
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  defaultSpots: string[];
}

const TEMPLATES: TemplateOption[] = [
  {
    type: 'home',
    name: 'My Home',
    icon: 'home',
    defaultSpots: ['Front Door', 'Living Room Sofa', 'TV Stand', 'Kitchen Dining Table', 'Bedroom Bed'],
  },
  {
    type: 'school',
    name: 'My School / Campus',
    icon: 'school',
    defaultSpots: ['Campus Gates', 'Library Steps', 'Lecture Hall Desk', 'Cafeteria Line', 'Courtyard Fountain'],
  },
  {
    type: 'work',
    name: 'My Workplace',
    icon: 'briefcase',
    defaultSpots: ['Office Lobby', 'Elevator', 'My Desk & Chair', 'Water Cooler', 'Conference Room'],
  },
  {
    type: 'route',
    name: 'Morning Commute',
    icon: 'map-marker-path',
    defaultSpots: ['Bus Stop Bench', 'Subway Turnstile', 'Corner Coffee Shop', 'Pedestrian Bridge', 'Office Entrance'],
  },
  {
    type: 'custom',
    name: 'Create Custom Palace',
    icon: 'palette',
    defaultSpots: ['Entrance', 'First Stop', 'Center Point', 'Back Corner', 'Exit Gate'],
  },
];

export const PalaceBuilderScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { goBack, palaces, updatePalaces, navigate } = useNavigation();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption>(TEMPLATES[0]);
  const [palaceName, setPalaceName] = useState(TEMPLATES[0].name);
  const [spots, setSpots] = useState<PalaceSpot[]>(
    TEMPLATES[0].defaultSpots.map((name, idx) => ({
      id: `spot_${Date.now()}_${idx}`,
      order: idx + 1,
      name,
      iconName: 'map-marker-outline',
    }))
  );
  const [newSpotName, setNewSpotName] = useState('');

  const handleSelectTemplate = (tpl: TemplateOption) => {
    setSelectedTemplate(tpl);
    setPalaceName(tpl.name);
    setSpots(
      tpl.defaultSpots.map((name, idx) => ({
        id: `spot_${Date.now()}_${idx}`,
        order: idx + 1,
        name,
        iconName: 'map-marker-outline',
      }))
    );
    setStep(2);
  };

  const handleAddSpot = () => {
    if (!newSpotName.trim()) return;
    const newSpot: PalaceSpot = {
      id: `spot_${Date.now()}`,
      order: spots.length + 1,
      name: newSpotName.trim(),
      iconName: 'map-marker-outline',
    };
    setSpots([...spots, newSpot]);
    setNewSpotName('');
  };

  const handleRemoveSpot = (id: string) => {
    if (spots.length <= 3) {
      Alert.alert('Minimum Spots', 'A memory palace needs at least 3 spots to be effective.');
      return;
    }
    const filtered = spots.filter((s) => s.id !== id);
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSpots(reordered);
  };

  const handleSavePalace = async () => {
    if (spots.length < 3) {
      Alert.alert('Too few spots', 'Please add at least 3 spots along your palace route.');
      return;
    }

    const newPalace: UserPalace = {
      id: `palace_${Date.now()}`,
      name: palaceName.trim() || 'My Memory Palace',
      type: selectedTemplate.type,
      iconName: selectedTemplate.icon,
      spots,
      createdAt: new Date().toISOString(),
    };

    await updatePalaces([newPalace, ...palaces]);
    Alert.alert('Palace Built! 🏛️', `"${newPalace.name}" with ${spots.length} spots is ready for training!`, [
      {
        text: 'Practice Now',
        onPress: () => navigate('practiceSession', { techniqueId: 'palace', level: 1 }),
      },
      {
        text: 'Done',
        onPress: () => goBack(),
      },
    ]);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Header
        title={step === 1 ? 'New Memory Palace' : 'Arrange Palace Spots'}
        subtitle={step === 1 ? 'Step 1: Choose a familiar location' : 'Step 2: Define your chronological route'}
        onBack={() => {
          if (step === 2) setStep(1);
          else goBack();
        }}
      />

      {step === 1 ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          <Text style={styles.prompt}>
            Pick a physical place you know so well you can walk through it with your eyes closed.
          </Text>

          <View style={styles.templateList}>
            {TEMPLATES.map((tpl) => (
              <Card
                key={tpl.type}
                style={styles.templateCard}
                onPress={() => handleSelectTemplate(tpl)}
              >
                <View style={styles.templateRow}>
                  <View style={styles.templateIconBox}>
                    <MaterialCommunityIcons name={tpl.icon} size={28} color={colors.palace} />
                  </View>
                  <View style={styles.templateTextWrap}>
                    <Text style={styles.templateTitle}>{tpl.name}</Text>
                    <Text style={styles.templateSubtitle}>
                      {tpl.defaultSpots.slice(0, 3).join(' • ')}...
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollBody,
            { paddingBottom: 120 + Math.max(insets.bottom, 16) },
          ]}
        >
          {/* Palace Name Input */}
          <Text style={styles.inputLabel}>Palace Name</Text>
          <TextInput
            value={palaceName}
            onChangeText={setPalaceName}
            placeholder="e.g. My Apartment"
            placeholderTextColor={colors.textMuted}
            style={styles.nameInput}
          />

          <View style={styles.spotsHeaderRow}>
            <Text style={styles.inputLabel}>Sequential Spots ({spots.length})</Text>
            <Text style={styles.spotsHint}>Always follow the same route</Text>
          </View>

          {/* Spots List */}
          <View style={styles.spotsList}>
            {spots.map((spot, idx) => (
              <View key={spot.id} style={styles.spotRow}>
                <View style={styles.spotOrderBadge}>
                  <Text style={styles.spotOrderText}>{idx + 1}</Text>
                </View>
                <View style={styles.spotInfo}>
                  <Text style={styles.spotName}>{spot.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveSpot(spot.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.spotDeleteBtn}
                >
                  <MaterialCommunityIcons name="close-circle-outline" size={22} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Add New Spot */}
          <View style={styles.addSpotRow}>
            <TextInput
              value={newSpotName}
              onChangeText={setNewSpotName}
              placeholder="Add next spot along your path..."
              placeholderTextColor={colors.textMuted}
              style={styles.addSpotInput}
              onSubmitEditing={handleAddSpot}
            />
            <TouchableOpacity
              onPress={handleAddSpot}
              disabled={!newSpotName.trim()}
              style={[styles.addSpotBtn, !newSpotName.trim() && styles.addSpotBtnDisabled]}
            >
              <MaterialCommunityIcons name="plus" size={24} color={colors.textInverse} />
            </TouchableOpacity>
          </View>

          <Card variant="tinted" tintColor={colors.palaceLight} style={styles.tipCard}>
            <Text style={styles.tipTitle}>Golden Rule for Spots 💡</Text>
            <Text style={styles.tipDesc}>
              Move in a single, natural direction (clockwise or entrance-to-back). Never backtrack or criss-cross your rooms!
            </Text>
          </Card>
        </ScrollView>
      )}

      {step === 2 && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Button
            label={`Save Palace (${spots.length} Spots)`}
            onPress={handleSavePalace}
            variant="palace"
            iconName="check"
          />
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  scrollBody: {
    paddingHorizontal: spacing.l,
    paddingBottom: 100,
  },
  prompt: {
    ...typography.bodyL,
    color: colors.textSecondary,
    marginBottom: spacing.l,
    lineHeight: 22,
  },
  templateList: {
    gap: spacing.m,
  },
  templateCard: {
    padding: spacing.l,
    borderRadius: radius.l,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.palaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  templateTextWrap: {
    flex: 1,
  },
  templateTitle: {
    ...typography.headingM,
    fontSize: 17,
    marginBottom: 2,
  },
  templateSubtitle: {
    ...typography.bodyS,
    color: colors.textSecondary,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.s,
    fontWeight: '700',
  },
  nameInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.l,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    fontWeight: '600',
  },
  spotsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  spotsHint: {
    ...typography.bodyS,
    color: colors.palace,
    fontWeight: '500',
  },
  spotsList: {
    gap: spacing.s,
    marginBottom: spacing.l,
  },
  spotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  spotOrderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.palaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  spotOrderText: {
    ...typography.bodyS,
    fontWeight: '700',
    color: colors.palace,
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    ...typography.bodyM,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  spotDeleteBtn: {
    padding: 4,
  },
  addSpotRow: {
    flexDirection: 'row',
    gap: spacing.s,
    marginBottom: spacing.xl,
  },
  addSpotInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.l,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  addSpotBtn: {
    backgroundColor: colors.palace,
    width: 48,
    height: 48,
    borderRadius: radius.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSpotBtnDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  tipCard: {
    padding: spacing.l,
    borderRadius: radius.l,
  },
  tipTitle: {
    ...typography.headingM,
    fontSize: 15,
    color: colors.palace,
    marginBottom: 4,
  },
  tipDesc: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    zIndex: 999,
    elevation: 10,
  },
});
