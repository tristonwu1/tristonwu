import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Ellipse,
} from "@react-pdf/renderer";
import type { AboutContent } from "@/data/about";

const fontDir = path.join(process.cwd(), "src", "cv", "fonts");

Font.register({
  family: "Martel",
  fonts: [
    { src: path.join(fontDir, "Martel-Light.ttf"), fontWeight: 300 },
    { src: path.join(fontDir, "Martel-Regular.ttf"), fontWeight: 400 },
    { src: path.join(fontDir, "Martel-DemiBold.ttf"), fontWeight: 600 },
  ],
});

Font.register({
  family: "MartelSans",
  fonts: [
    { src: path.join(fontDir, "MartelSans-Light.ttf"), fontWeight: 300 },
    { src: path.join(fontDir, "MartelSans-Regular.ttf"), fontWeight: 400 },
    { src: path.join(fontDir, "MartelSans-SemiBold.ttf"), fontWeight: 600 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const COLOR = {
  paper: "#f4f1eb",
  ink: "#1a1917",
  muted: "#6f6a62",
  border: "#d8d2c6",
  accent: "#8a8478",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLOR.paper,
    color: COLOR.ink,
    fontFamily: "MartelSans",
    fontWeight: 400,
    fontSize: 9.5,
    lineHeight: 1.5,
    paddingTop: 46,
    paddingBottom: 40,
    paddingLeft: 56,
    paddingRight: 132,
  },
  eyebrow: {
    fontFamily: "MartelSans",
    fontWeight: 600,
    fontSize: 7.5,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: COLOR.muted,
    marginBottom: 8,
  },
  name: {
    fontFamily: "Martel",
    fontWeight: 300,
    fontSize: 34,
    letterSpacing: -0.5,
    lineHeight: 1,
  },
  metaRow: {
    marginTop: 10,
    flexDirection: "column",
    gap: 1.5,
  },
  meta: {
    fontSize: 9,
    color: COLOR.muted,
  },
  rule: {
    marginTop: 16,
    marginBottom: 16,
    borderBottomWidth: 0.75,
    borderBottomColor: COLOR.border,
  },
  para: {
    fontSize: 9.5,
    lineHeight: 1.5,
    marginBottom: 6,
    color: COLOR.ink,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: "MartelSans",
    fontWeight: 600,
    fontSize: 7.5,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COLOR.muted,
    marginBottom: 10,
  },
  statementBody: {
    fontFamily: "Martel",
    fontWeight: 400,
    fontSize: 10,
    lineHeight: 1.55,
    marginBottom: 6,
  },
  cvGroup: {
    marginBottom: 11,
  },
  cvHeading: {
    fontFamily: "Martel",
    fontWeight: 600,
    fontSize: 11,
    marginBottom: 6,
  },
  cvEntry: {
    flexDirection: "row",
    marginBottom: 3.5,
  },
  cvYear: {
    width: 42,
    color: COLOR.muted,
    fontSize: 9.5,
  },
  cvDetail: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.5,
  },
  contact: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 0.75,
    borderTopColor: COLOR.border,
    flexDirection: "row",
    gap: 36,
  },
  contactBlock: {
    flexDirection: "column",
    gap: 2,
  },
  contactLabel: {
    fontFamily: "MartelSans",
    fontWeight: 600,
    fontSize: 6.5,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: COLOR.muted,
  },
  contactValue: {
    fontSize: 9.5,
  },
  rail: {
    position: "absolute",
    top: 54,
    bottom: 54,
    right: 44,
    width: 64,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  railCaption: {
    marginTop: 12,
    fontFamily: "MartelSans",
    fontWeight: 600,
    fontSize: 6,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: COLOR.muted,
    transform: "rotate(90deg)",
  },
});

/** Decorative stone stack echoing the homepage rock tower. */
type Stone = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill: string;
  opacity: number;
};

const STONES: Stone[] = [
  { cx: 33, cy: 470, rx: 31, ry: 17, fill: COLOR.accent, opacity: 0.92 },
  { cx: 29, cy: 438, rx: 27, ry: 15.5, fill: COLOR.muted, opacity: 0.85 },
  { cx: 35, cy: 408, rx: 24, ry: 14.5, fill: COLOR.accent, opacity: 0.78 },
  { cx: 30, cy: 381, rx: 20, ry: 13, fill: COLOR.muted, opacity: 0.7 },
  { cx: 34, cy: 358, rx: 16.5, ry: 11, fill: COLOR.accent, opacity: 0.62 },
  { cx: 31, cy: 339, rx: 13, ry: 9, fill: COLOR.muted, opacity: 0.54 },
  { cx: 33, cy: 324, rx: 9.5, ry: 7, fill: COLOR.accent, opacity: 0.46 },
];

function StoneStack() {
  return (
    <Svg width={66} height={500} viewBox="0 0 66 500">
      {STONES.map((s, i) => (
        <Ellipse
          key={i}
          cx={s.cx}
          cy={s.cy}
          rx={s.rx}
          ry={s.ry}
          fill={s.fill}
          fillOpacity={s.opacity}
          stroke={COLOR.ink}
          strokeOpacity={0.12}
          strokeWidth={0.6}
        />
      ))}
    </Svg>
  );
}

export function CvDocument({ about }: { about: AboutContent }) {
  const hasCv = about.cv.some((section) => section.entries.length > 0);

  return (
    <Document
      title={`${about.title} — CV`}
      author={about.title}
      subject="Curriculum Vitae"
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.rail} fixed>
          <StoneStack />
          <Text style={styles.railCaption}>Triston Wu</Text>
        </View>

        <Text style={styles.eyebrow}>Curriculum Vitae</Text>
        <Text style={styles.name}>{about.title}</Text>
        <View style={styles.metaRow}>
          {about.born ? <Text style={styles.meta}>Born {about.born}</Text> : null}
          {about.based ? <Text style={styles.meta}>{about.based}</Text> : null}
        </View>

        <View style={styles.rule} />

        {about.bio.length > 0 ? (
          <View>
            {about.bio.map((paragraph, index) => (
              <Text key={index} style={styles.para}>
                {paragraph}
              </Text>
            ))}
          </View>
        ) : null}

        {about.statement.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statement</Text>
            {about.statement.map((paragraph, index) => (
              <Text key={index} style={styles.statementBody}>
                {paragraph}
              </Text>
            ))}
          </View>
        ) : null}

        {hasCv ? (
          <View style={styles.section}>
            {about.cv.map((section) =>
              section.entries.length > 0 ? (
                <View key={section.heading} style={styles.cvGroup} wrap={false}>
                  <Text style={styles.cvHeading}>{section.heading}</Text>
                  {section.entries.map((entry, index) => (
                    <View key={index} style={styles.cvEntry}>
                      <Text style={styles.cvYear}>{entry.year}</Text>
                      <Text style={styles.cvDetail}>{entry.detail}</Text>
                    </View>
                  ))}
                </View>
              ) : null
            )}
          </View>
        ) : null}

        <View style={styles.contact}>
          {about.enquiriesEmail ? (
            <View style={styles.contactBlock}>
              <Text style={styles.contactLabel}>Enquiries</Text>
              <Text style={styles.contactValue}>{about.enquiriesEmail}</Text>
            </View>
          ) : null}
          {about.instagramLabel ? (
            <View style={styles.contactBlock}>
              <Text style={styles.contactLabel}>Instagram</Text>
              <Text style={styles.contactValue}>{about.instagramLabel}</Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
