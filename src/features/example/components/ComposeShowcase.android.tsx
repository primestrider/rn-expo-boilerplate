import {
  AlertDialog,
  AssistChip,
  BadgedBox,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Column,
  ContainedLoadingIndicator,
  DropdownMenu,
  DropdownMenuItem,
  ElevatedButton,
  ElevatedCard,
  ExposedDropdownMenu,
  ExposedDropdownMenuBox,
  ExtendedFloatingActionButton,
  FilledIconButton,
  FilledTonalButton,
  FilledTonalIconButton,
  FilterChip,
  FloatingActionButton,
  FlowRow,
  HorizontalDivider,
  HorizontalMultiBrowseCarousel,
  Icon,
  IconButton,
  IconToggleButton,
  LinearWavyProgressIndicator,
  ListItem,
  LoadingIndicator,
  MultiChoiceSegmentedButtonRow,
  OutlinedButton,
  OutlinedCard,
  OutlinedIconButton,
  OutlinedTextField,
  RadioButton,
  Row,
  SegmentedButton,
  Slider,
  SmallFloatingActionButton,
  SuggestionChip,
  Surface,
  Switch,
  Text,
  TextButton,
  TextField,
  ToggleButton,
  TriStateCheckbox,
  useMaterialColors,
  useNativeState,
  type ToggleableState,
} from "@expo/ui/jetpack-compose";
import {
  background,
  clickable,
  fillMaxWidth,
  height,
  menuAnchor,
  paddingAll,
  size,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useState } from "react";
import { View } from "react-native";

import { AppText } from "@/shared/components";
import {
  NativeHost,
  ProgressIndicator,
  SegmentedControl,
} from "@/shared/native-ui";
import { useStyles, view } from "@/styles";

import { Section } from "./Section";

const ADD = require("@/assets/icons/add.xml");
const CHECK = require("@/assets/icons/check.xml");
const FAVORITE = require("@/assets/icons/favorite.xml");

const FILTERS = ["Nearby", "Open now", "Top rated"] as const;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const SORTS = ["Newest", "Oldest", "Popular"] as const;
const PLANS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
];
const SLIDES = ["Mountains", "Coast", "Forest", "Desert", "City"];

/** Material 3 swatches read straight from the host's generated palette. */
const SWATCHES = [
  "primary",
  "primaryContainer",
  "secondary",
  "secondaryContainer",
  "tertiary",
  "tertiaryContainer",
  "surfaceContainer",
  "error",
] as const;

const NEXT_TRI_STATE: Record<ToggleableState, ToggleableState> = {
  off: "indeterminate",
  indeterminate: "on",
  on: "off",
};

/**
 * Jetpack Compose components from `@expo/ui/jetpack-compose`. Android only:
 * iOS and web load the `ComposeShowcase.tsx` sibling instead, because these
 * imports crash outside Android.
 */
export function ComposeShowcase() {
  const styles = useStyles();

  const [presses, setPresses] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bold, setBold] = useState(true);
  const [fabExpanded, setFabExpanded] = useState(true);
  const [filters, setFilters] = useState<string[]>(["Open now"]);
  const [checked, setChecked] = useState(true);
  const [tri, setTri] = useState<ToggleableState>("indeterminate");
  const [radio, setRadio] = useState("Standard");
  const [wifi, setWifi] = useState(true);
  const [brightness, setBrightness] = useState(0.6);
  const [plan, setPlan] = useState("pro");
  const [days, setDays] = useState<string[]>(["Mon", "Wed"]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sort, setSort] = useState<string>("Newest");
  const [exposedOpen, setExposedOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const email = useNativeState("");
  const password = useNativeState("");
  const sortText = useNativeState<string>("Newest");

  const toggle = (list: string[], item: string) =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  return (
    <>
      <Section
        title="Buttons"
        description="The five Material 3 button emphasis levels"
        utilities={["Button", "FilledTonal", "Elevated", "Outlined", "Text"]}
      >
        <NativeHost matchContents={{ vertical: true }}>
          <FlowRow
            horizontalArrangement={{ spacedBy: 8 }}
            verticalArrangement={{ spacedBy: 8 }}
          >
            <Button onClick={() => setPresses((n) => n + 1)}>
              <Text>Filled</Text>
            </Button>
            <FilledTonalButton onClick={() => setPresses((n) => n + 1)}>
              <Text>Tonal</Text>
            </FilledTonalButton>
            <ElevatedButton onClick={() => setPresses((n) => n + 1)}>
              <Text>Elevated</Text>
            </ElevatedButton>
            <OutlinedButton onClick={() => setPresses((n) => n + 1)}>
              <Text>Outlined</Text>
            </OutlinedButton>
            <TextButton onClick={() => setPresses((n) => n + 1)}>
              <Text>Text</Text>
            </TextButton>
            <Button enabled={false}>
              <Text>Disabled</Text>
            </Button>
          </FlowRow>
        </NativeHost>
        <AppText variant="caption" color="muted" style={styles.mt2}>
          Pressed {presses} times
        </AppText>
      </Section>

      <Section
        title="Icon & toggle buttons"
        description="Icon buttons in four styles, plus checked toggles"
        utilities={["IconButton", "IconToggleButton", "ToggleButton"]}
      >
        <NativeHost matchContents={{ vertical: true }}>
          <FlowRow
            horizontalArrangement={{ spacedBy: 8 }}
            verticalArrangement={{ spacedBy: 8 }}
          >
            <IconButton onClick={() => {}}>
              <Icon source={ADD} contentDescription="Add" />
            </IconButton>
            <FilledIconButton onClick={() => {}}>
              <Icon source={ADD} contentDescription="Add" />
            </FilledIconButton>
            <FilledTonalIconButton onClick={() => {}}>
              <Icon source={ADD} contentDescription="Add" />
            </FilledTonalIconButton>
            <OutlinedIconButton onClick={() => {}}>
              <Icon source={ADD} contentDescription="Add" />
            </OutlinedIconButton>
            <IconToggleButton checked={liked} onCheckedChange={setLiked}>
              <Icon source={FAVORITE} contentDescription="Like" />
            </IconToggleButton>
            <ToggleButton checked={bold} onCheckedChange={setBold}>
              <Text>Bold</Text>
            </ToggleButton>
          </FlowRow>
        </NativeHost>
      </Section>

      <Section
        title="Floating action buttons"
        description="Small, regular and extended — tap the extended one to collapse it"
        utilities={["SmallFloatingActionButton", "ExtendedFloatingActionButton"]}
      >
        <NativeHost matchContents={{ vertical: true }}>
          <Row
            horizontalArrangement={{ spacedBy: 16 }}
            verticalAlignment="center"
          >
            <SmallFloatingActionButton onClick={() => {}}>
              <SmallFloatingActionButton.Icon>
                <Icon source={ADD} />
              </SmallFloatingActionButton.Icon>
            </SmallFloatingActionButton>
            <FloatingActionButton onClick={() => {}}>
              <FloatingActionButton.Icon>
                <Icon source={ADD} />
              </FloatingActionButton.Icon>
            </FloatingActionButton>
            <ExtendedFloatingActionButton
              expanded={fabExpanded}
              onClick={() => setFabExpanded((v) => !v)}
            >
              <ExtendedFloatingActionButton.Icon>
                <Icon source={ADD} />
              </ExtendedFloatingActionButton.Icon>
              <ExtendedFloatingActionButton.Text>
                <Text>Compose</Text>
              </ExtendedFloatingActionButton.Text>
            </ExtendedFloatingActionButton>
          </Row>
        </NativeHost>
      </Section>

      <Section
        title="Chips"
        description="Assist, filter and suggestion chips"
        utilities={["AssistChip", "FilterChip", "SuggestionChip"]}
      >
        <NativeHost matchContents={{ vertical: true }}>
          <FlowRow
            horizontalArrangement={{ spacedBy: 8 }}
            verticalArrangement={{ spacedBy: 8 }}
          >
            <AssistChip onClick={() => {}}>
              <AssistChip.LeadingIcon>
                <Icon source={ADD} size={18} />
              </AssistChip.LeadingIcon>
              <AssistChip.Label>
                <Text>Add to calendar</Text>
              </AssistChip.Label>
            </AssistChip>
            {FILTERS.map((filter) => {
              const selected = filters.includes(filter);
              return (
                <FilterChip
                  key={filter}
                  selected={selected}
                  onClick={() => setFilters((list) => toggle(list, filter))}
                >
                  {selected ? (
                    <FilterChip.LeadingIcon>
                      <Icon source={CHECK} size={18} />
                    </FilterChip.LeadingIcon>
                  ) : null}
                  <FilterChip.Label>
                    <Text>{filter}</Text>
                  </FilterChip.Label>
                </FilterChip>
              );
            })}
            <SuggestionChip onClick={() => {}}>
              <SuggestionChip.Label>
                <Text>Try “coffee”</Text>
              </SuggestionChip.Label>
            </SuggestionChip>
          </FlowRow>
        </NativeHost>
      </Section>

      <Section
        title="Selection controls"
        description="Checkbox (incl. tri-state), radio buttons, switch with icon, stepped slider"
        utilities={["Checkbox", "TriStateCheckbox", "RadioButton", "Switch", "Slider"]}
      >
        <NativeHost matchContents={{ vertical: true }}>
          <Column verticalArrangement={{ spacedBy: 4 }}>
            <Row verticalAlignment="center">
              <Checkbox value={checked} onCheckedChange={setChecked} />
              <Text>Remember me</Text>
            </Row>
            <Row verticalAlignment="center">
              <TriStateCheckbox
                state={tri}
                onClick={() => setTri((s) => NEXT_TRI_STATE[s])}
              />
              <Text>{`Select all (${tri})`}</Text>
            </Row>
            <HorizontalDivider />
            {["Standard", "Express", "Overnight"].map((option) => (
              <Row
                key={option}
                verticalAlignment="center"
                modifiers={[clickable(() => setRadio(option))]}
              >
                <RadioButton
                  selected={radio === option}
                  onClick={() => setRadio(option)}
                />
                <Text>{option}</Text>
              </Row>
            ))}
            <HorizontalDivider />
            <Row verticalAlignment="center">
              <Text modifiers={[weight(1)]}>Wi‑Fi</Text>
              <Switch value={wifi} onCheckedChange={setWifi}>
                {wifi ? (
                  <Switch.ThumbContent>
                    <Icon source={CHECK} size={Switch.DefaultIconSize} />
                  </Switch.ThumbContent>
                ) : null}
              </Switch>
            </Row>
            <Text>{`Brightness ${Math.round(brightness * 100)}%`}</Text>
            <Slider
              value={brightness}
              onValueChange={setBrightness}
              steps={9}
            />
          </Column>
        </NativeHost>
      </Section>

      <Section
        title="Segmented buttons"
        description="Single choice (via SegmentedControl) and multi choice"
        utilities={["SingleChoice", "MultiChoice"]}
      >
        <View style={view(styles.gap3)}>
          <SegmentedControl options={PLANS} value={plan} onChange={setPlan} />
          <NativeHost matchContents={{ vertical: true }}>
            <MultiChoiceSegmentedButtonRow modifiers={[fillMaxWidth()]}>
              {DAYS.map((day) => (
                <SegmentedButton
                  key={day}
                  checked={days.includes(day)}
                  onCheckedChange={() => setDays((list) => toggle(list, day))}
                >
                  <SegmentedButton.Label>
                    <Text>{day}</Text>
                  </SegmentedButton.Label>
                </SegmentedButton>
              ))}
            </MultiChoiceSegmentedButtonRow>
          </NativeHost>
        </View>
      </Section>

      <Section
        title="Text fields"
        description="Filled and outlined, with label, placeholder and icon"
        utilities={["TextField", "OutlinedTextField", "useNativeState"]}
      >
        <NativeHost matchContents={{ vertical: true }}>
          <Column verticalArrangement={{ spacedBy: 12 }}>
            <TextField value={email} singleLine modifiers={[fillMaxWidth()]}>
              <TextField.Label>
                <Text>Email</Text>
              </TextField.Label>
              <TextField.Placeholder>
                <Text>you@example.com</Text>
              </TextField.Placeholder>
            </TextField>
            <OutlinedTextField
              value={password}
              singleLine
              visualTransformation="password"
              modifiers={[fillMaxWidth()]}
            >
              <OutlinedTextField.Label>
                <Text>Password</Text>
              </OutlinedTextField.Label>
            </OutlinedTextField>
          </Column>
        </NativeHost>
      </Section>

      <Section
        title="Menus"
        description="A dropdown menu and an exposed dropdown (Material select)"
        utilities={["DropdownMenu", "ExposedDropdownMenuBox"]}
      >
        <NativeHost matchContents={{ vertical: true }}>
          <Column verticalArrangement={{ spacedBy: 12 }}>
            <DropdownMenu
              expanded={menuOpen}
              onDismissRequest={() => setMenuOpen(false)}
            >
              <DropdownMenu.Trigger>
                <OutlinedButton onClick={() => setMenuOpen(true)}>
                  <Text>{`Sort: ${sort}`}</Text>
                </OutlinedButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Items>
                {SORTS.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => {
                      setSort(option);
                      setMenuOpen(false);
                    }}
                  >
                    <DropdownMenuItem.Text>
                      <Text>{option}</Text>
                    </DropdownMenuItem.Text>
                  </DropdownMenuItem>
                ))}
              </DropdownMenu.Items>
            </DropdownMenu>

            <ExposedDropdownMenuBox
              expanded={exposedOpen}
              onExpandedChange={setExposedOpen}
            >
              <TextField
                value={sortText}
                readOnly
                singleLine
                modifiers={[menuAnchor(), fillMaxWidth()]}
              >
                <TextField.Label>
                  <Text>Sort by</Text>
                </TextField.Label>
              </TextField>
              <ExposedDropdownMenu
                expanded={exposedOpen}
                onDismissRequest={() => setExposedOpen(false)}
              >
                {SORTS.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => {
                      sortText.value = option;
                      setExposedOpen(false);
                    }}
                  >
                    <DropdownMenuItem.Text>
                      <Text>{option}</Text>
                    </DropdownMenuItem.Text>
                  </DropdownMenuItem>
                ))}
              </ExposedDropdownMenu>
            </ExposedDropdownMenuBox>
          </Column>
        </NativeHost>
      </Section>

      <Section
        title="Cards, surface & list item"
        description="Filled, elevated and outlined cards; a Material list row with a badge"
        utilities={["Card", "ElevatedCard", "OutlinedCard", "Surface", "ListItem", "BadgedBox"]}
      >
        <NativeHost matchContents={{ vertical: true }}>
          <Column verticalArrangement={{ spacedBy: 12 }}>
            <Card modifiers={[fillMaxWidth()]}>
              <Column modifiers={[paddingAll(16)]}>
                <Text style={{ typography: "titleMedium" }}>Filled card</Text>
                <Text style={{ typography: "bodyMedium" }}>
                  Uses surfaceContainerHighest.
                </Text>
              </Column>
            </Card>
            <ElevatedCard modifiers={[fillMaxWidth()]}>
              <Column modifiers={[paddingAll(16)]}>
                <Text style={{ typography: "titleMedium" }}>Elevated card</Text>
              </Column>
            </ElevatedCard>
            <OutlinedCard modifiers={[fillMaxWidth()]}>
              <Column modifiers={[paddingAll(16)]}>
                <Text style={{ typography: "titleMedium" }}>Outlined card</Text>
              </Column>
            </OutlinedCard>
            <Surface tonalElevation={4} modifiers={[fillMaxWidth()]}>
              <ListItem>
                <ListItem.LeadingContent>
                  <BadgedBox>
                    <BadgedBox.Badge>
                      <Badge>
                        <Text>3</Text>
                      </Badge>
                    </BadgedBox.Badge>
                    <Icon source={FAVORITE} contentDescription="Favorites" />
                  </BadgedBox>
                </ListItem.LeadingContent>
                <ListItem.HeadlineContent>
                  <Text>Favorites</Text>
                </ListItem.HeadlineContent>
                <ListItem.SupportingContent>
                  <Text>3 new items</Text>
                </ListItem.SupportingContent>
                <ListItem.TrailingContent>
                  <Text>Today</Text>
                </ListItem.TrailingContent>
              </ListItem>
            </Surface>
          </Column>
        </NativeHost>
      </Section>

      <Section
        title="Progress & loading"
        description="Linear, circular, wavy, and the M3 Expressive loading indicator"
        utilities={["ProgressIndicator", "LinearWavy", "LoadingIndicator"]}
      >
        <View style={view(styles.gap3)}>
          <ProgressIndicator value={0.6} />
          <ProgressIndicator />
          <NativeHost matchContents={{ vertical: true }}>
            <Column verticalArrangement={{ spacedBy: 16 }}>
              <LinearWavyProgressIndicator
                progress={0.6}
                modifiers={[fillMaxWidth()]}
              />
              <Row
                horizontalArrangement={{ spacedBy: 24 }}
                verticalAlignment="center"
              >
                <LoadingIndicator />
                <ContainedLoadingIndicator />
              </Row>
            </Column>
          </NativeHost>
          <ProgressIndicator type="circular" value={0.3} />
        </View>
      </Section>

      <Section
        title="Carousel"
        description="Multi-browse carousel: large, medium and small items"
        utilities={["HorizontalMultiBrowseCarousel"]}
      >
        <NativeHost matchContents={{ vertical: true }}>
          <HorizontalMultiBrowseCarousel
            preferredItemWidth={180}
            itemSpacing={8}
            modifiers={[height(160)]}
          >
            {SLIDES.map((slide) => (
              <Card key={slide}>
                <Box modifiers={[size(180, 160), paddingAll(16)]}>
                  <Text style={{ typography: "titleMedium" }}>{slide}</Text>
                </Box>
              </Card>
            ))}
          </HorizontalMultiBrowseCarousel>
        </NativeHost>
      </Section>

      <Section
        title="Alert dialog"
        description="Material dialog with confirm and dismiss actions"
        utilities={["AlertDialog", "onDismissRequest"]}
      >
        <NativeHost matchContents>
          <Column>
            <Button onClick={() => setDialogOpen(true)}>
              <Text>Delete draft</Text>
            </Button>
            {dialogOpen ? (
              <AlertDialog onDismissRequest={() => setDialogOpen(false)}>
                <AlertDialog.Title>
                  <Text>Delete draft?</Text>
                </AlertDialog.Title>
                <AlertDialog.Text>
                  <Text>{"This can't be undone."}</Text>
                </AlertDialog.Text>
                <AlertDialog.ConfirmButton>
                  <TextButton onClick={() => setDialogOpen(false)}>
                    <Text>Delete</Text>
                  </TextButton>
                </AlertDialog.ConfirmButton>
                <AlertDialog.DismissButton>
                  <TextButton onClick={() => setDialogOpen(false)}>
                    <Text>Cancel</Text>
                  </TextButton>
                </AlertDialog.DismissButton>
              </AlertDialog>
            ) : null}
          </Column>
        </NativeHost>
      </Section>

      <Section
        title="Material colors"
        description="The palette NativeHost generates from colors.primary"
        utilities={["useMaterialColors"]}
      >
        <MaterialSwatches />
      </Section>
    </>
  );
}

/**
 * Reads the Material 3 scheme inside the host, where the seed from
 * `NativeHost` applies — a hook outside it would see the default palette.
 */
function MaterialSwatches() {
  return (
    <NativeHost matchContents={{ vertical: true }}>
      <SwatchGrid />
    </NativeHost>
  );
}

function SwatchGrid() {
  const palette = useMaterialColors();

  return (
    <FlowRow
      horizontalArrangement={{ spacedBy: 8 }}
      verticalArrangement={{ spacedBy: 8 }}
    >
      {SWATCHES.map((name) => (
        <Column key={name} verticalArrangement={{ spacedBy: 4 }}>
          <Box modifiers={[size(64, 40), background(palette[name])]} />
          <Text style={{ typography: "labelSmall" }}>{name}</Text>
        </Column>
      ))}
    </FlowRow>
  );
}
