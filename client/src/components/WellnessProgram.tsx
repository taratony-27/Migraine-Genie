import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  Divider,
  Button,
  Link,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";

// ───────────────────────────────────────────
// Extended Wellness Articles
// ───────────────────────────────────────────
const wellnessItems = [
  { title: "6 Simple Stretches for Migraine Relief", desc: "Gentle movements to release neck tension and reduce migraine triggers." },
  { title: "Tai Chi for Migraine Relief", desc: "How Tai Chi enhances balance, reduces stress, and regulates migraine episodes." },
  { title: "High-Intensity Aerobic Exercise & Migraines", desc: "Why structured cardio routines help lower migraine frequency." },
  { title: "Meditation for Migraine Relief", desc: "How deep breathing and awareness calm the nervous system." },
  { title: "Yoga Nidra for Migraine Prevention", desc: "A guided sleep-like meditation to reduce stress and pain sensitivity." },
  { title: "Hydration Strategies for Migraine Sufferers", desc: "Small habits that prevent dehydration-triggered migraines." },
  { title: "Foods That Reduce Inflammation", desc: "Anti-inflammatory foods to ease chronic symptoms." },
  { title: "Trigger Tracking: The Smart Way", desc: "How to identify and eliminate hidden migraine triggers." },
  { title: "Blue Light & Digital Migraine", desc: "Reduce screen strain and protect visual comfort." },
  { title: "Healthy Sleep Hygiene Checklist", desc: "Improve sleep quality with evidence-based methods." },
  { title: "Progressive Muscle Relaxation (PMR)", desc: "Lower muscle tension and soothe your nervous system." },
  { title: "Guided Nature Visualization", desc: "Mental imagery techniques to reduce pain intensity." },
  { title: "Breathing Exercises for Calmness", desc: "4-7-8 and diaphragmatic breathing for immediate relief." },
  { title: "Understanding Hormonal Migraine", desc: "Learn why hormones impact pain cycles and how to manage them." },
  { title: "Warm Compress Therapy", desc: "When and how to use heat to release tension headaches." },
  { title: "Cold Therapy for Migraines", desc: "Icing methods that reduce inflammation and throbbing pain." },
  { title: "Walking Meditation", desc: "A quiet stroll to relax the mind and reset tension." },
  { title: "Posture Correction for Migraine Relief", desc: "Reduce neck strain from poor desk ergonomics." },
  { title: "Journaling for Stress Reduction", desc: "How writing helps clear cognitive overload." },
  { title: "Aromatherapy for Migraine Relief", desc: "Lavender, peppermint, eucalyptus – science-backed choices." },
];

// ───────────────────────────────────────────
// Component
// ───────────────────────────────────────────
const WellnessProgram: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("az");

  // ────────────────────────────────────────
  // Filtering + Sorting
  // ────────────────────────────────────────
  const processedItems = useMemo(() => {
    let filtered = wellnessItems.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === "az") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "za") {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === "recent") {
      // Assume list order = newest last → reverse for most recent
      filtered = [...filtered].reverse();
    }

    return filtered;
  }, [search, sortBy]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        px: 2,
        py: { xs: 4, sm: 6 },
      }}
    >
      {/* Header */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        Wellness Program
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        textAlign="center"
        mb={5}
        sx={{ maxWidth: 700, margin: "0 auto" }}
      >
        Explore curated exercises, mindfulness techniques, and migraine-friendly
        wellness strategies—personalized to help improve your daily well-being.
      </Typography>

      {/* Search + Sort Bar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4,
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <TextField
          fullWidth
          placeholder="Search wellness tips..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ minWidth: 180 }}>
          <Select
            fullWidth
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            startAdornment={<SortIcon sx={{ mr: 1 }} />}
          >
            <MenuItem value="az">Sort: A → Z</MenuItem>
            <MenuItem value="za">Sort: Z → A</MenuItem>
            <MenuItem value="recent">Sort: Recently Added</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Wellness Grid */}
      <Grid container spacing={3}>
        {processedItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                transition: "0.25s ease",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="700" gutterBottom>
                  {item.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, minHeight: 50 }}
                >
                  {item.desc}
                </Typography>

                <Link
                  component="button"
                  underline="hover"
                  color="primary"
                  sx={{ fontWeight: 600, fontSize: "0.85rem" }}
                >
                  Read More »
                </Link>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* CTA */}
      <Box textAlign="center" mt={6}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{
            borderRadius: 8,
            px: 5,
            py: 1.5,
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
          href="/goal-tracker"
        >
          Goal Tracker
        </Button>
      </Box>
    </Box>
  );
};

export default WellnessProgram;
