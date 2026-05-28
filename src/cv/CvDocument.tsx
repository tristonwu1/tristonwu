import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
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
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLOR.paper,
    color: COLOR.ink,
    fontFamily: "MartelSans",
    fontWeight: 400,
    fontSize: 10,
    lineHeight: 1.55,
    paddingTop: 72,
    paddingBottom: 64,
    paddingHorizontal: 64,
  },
  name: {
    fontFamily: "Martel",
    fontWeight: 400,
    fontSize: 20,
    lineHeight: 1.1,
    letterSpacing: 0.2,
  },
  metaBlock: {
    marginTop: 10,
  },
  meta: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: COLOR.muted,
  },
  rule: {
    marginTop: 22,
    marginBottom: 4,
    borderBottomWidth: 0.75,
    borderBottomColor: COLOR.border,
  },
  group: {
    marginTop: 22,
  },
  groupTitle: {
    fontFamily: "MartelSans",
    fontWeight: 600,
    fontSize: 8,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: COLOR.muted,
    marginBottom: 9,
  },
  entry: {
    flexDirection: "row",
    marginBottom: 4,
  },
  year: {
    width: 46,
    color: COLOR.muted,
    fontSize: 10,
  },
  detail: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.45,
  },
  contact: {
    marginTop: 36,
    flexDirection: "row",
    gap: 40,
  },
  contactLabel: {
    fontFamily: "MartelSans",
    fontWeight: 600,
    fontSize: 7,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: COLOR.muted,
    marginBottom: 3,
  },
  contactValue: {
    fontSize: 10,
  },
  prose: {
    fontFamily: "Martel",
    fontWeight: 400,
    fontSize: 11,
    lineHeight: 1.7,
    marginBottom: 10,
  },
});

export function CvDocument({ about }: { about: AboutContent }) {
  return (
    <Document
      title={`${about.title} — CV`}
      author={about.title}
      subject="Curriculum Vitae"
    >
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.name}>{about.title}</Text>
        {about.born || about.based ? (
          <View style={styles.metaBlock}>
            {about.born ? (
              <Text style={styles.meta}>Born {about.born}</Text>
            ) : null}
            {about.based ? <Text style={styles.meta}>{about.based}</Text> : null}
          </View>
        ) : null}

        <View style={styles.rule} />

        {about.cv.map((section) =>
          section.entries.length > 0 ? (
            <View key={section.heading} style={styles.group} wrap={false}>
              <Text style={styles.groupTitle}>{section.heading}</Text>
              {section.entries.map((entry, index) => (
                <View key={index} style={styles.entry}>
                  <Text style={styles.year}>{entry.year}</Text>
                  <Text style={styles.detail}>{entry.detail}</Text>
                </View>
              ))}
            </View>
          ) : null
        )}

        {about.enquiriesEmail || about.instagramLabel ? (
          <View style={styles.contact}>
            {about.enquiriesEmail ? (
              <View>
                <Text style={styles.contactLabel}>Enquiries</Text>
                <Text style={styles.contactValue}>{about.enquiriesEmail}</Text>
              </View>
            ) : null}
            {about.instagramLabel ? (
              <View>
                <Text style={styles.contactLabel}>Instagram</Text>
                <Text style={styles.contactValue}>{about.instagramLabel}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </Page>

      <Page size="LETTER" style={styles.page}>
        {about.bio.length > 0 ? (
          <View>
            <Text style={styles.groupTitle}>Artist Bio</Text>
            {about.bio.map((paragraph, index) => (
              <Text key={index} style={styles.prose}>
                {paragraph}
              </Text>
            ))}
          </View>
        ) : null}

        {about.statement.length > 0 ? (
          <View style={{ marginTop: about.bio.length > 0 ? 22 : 0 }}>
            <Text style={styles.groupTitle}>Artist Statement</Text>
            {about.statement.map((paragraph, index) => (
              <Text key={index} style={styles.prose}>
                {paragraph}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
