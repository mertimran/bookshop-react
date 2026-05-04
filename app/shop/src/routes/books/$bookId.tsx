import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Typography,
  Box,
  Button,
  Chip,
  Rating,
  Paper,
  Divider,
  Grid,
  Container,
  alpha,
  useTheme,
  Skeleton,
  Card,
  CardContent,
  CardActions,
  IconButton,
  TextField,
  Stack,
  Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { catalogApi, type Book, type Review } from "@bookshop/shared/api";
import { useAuth } from "@bookshop/shared/auth";
import { addToCart } from "../../cart";

export const Route = createFileRoute("/books/$bookId")({
  component: BookDetailPage,
});

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #1A7B6E 0%, #2A9D8F 100%)",
  "linear-gradient(135deg, #E89C20 0%, #F5C565 100%)",
  "linear-gradient(135deg, #145F55 0%, #1A7B6E 100%)",
  "linear-gradient(135deg, #C47F0A 0%, #E89C20 100%)",
  "linear-gradient(135deg, #2A9D8F 0%, #B8D4C0 100%)",
  "linear-gradient(135deg, #1A7B6E 0%, #E89C20 100%)",
];

function gradientFor(title: string) {
  return COVER_GRADIENTS[title.charCodeAt(0) % COVER_GRADIENTS.length];
}

function BookDetailPage() {
  const { bookId } = Route.useParams();
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setLoading(true);
    catalogApi
      .getBook(bookId)
      .then(setBook)
      .finally(() => setLoading(false));
  }, [bookId]);

  useEffect(() => {
    if (!book) return;
    const genreIds = (book.genres ?? [])
      .map((bg) => bg.genre?.ID)
      .filter((id): id is number => typeof id === "number");

    catalogApi
      .getBooks("$expand=genres($expand=genre)")
      .then((r) => {
        const candidates = r.value.filter((b) => b.ID !== book.ID);
        const ranked = genreIds.length
          ? candidates
              .map((b) => ({
                book: b,
                shared:
                  b.genres?.filter((bg) =>
                    bg.genre && genreIds.includes(bg.genre.ID),
                  ).length ?? 0,
              }))
              .filter((x) => x.shared > 0)
              .sort((a, b) => b.shared - a.shared)
              .map((x) => x.book)
          : candidates;
        setRecommendations(ranked.slice(0, 10));
      })
      .catch(() => setRecommendations([]));
  }, [book]);

  useEffect(() => {
    catalogApi
      .getReviews(`$filter=book_ID eq ${bookId}&$orderby=createdAt desc`)
      .then((r) => setReviews(r.value))
      .catch(() => setReviews([]));
  }, [bookId]);

  const reload = () =>
    catalogApi
      .getReviews(`$filter=book_ID eq ${bookId}&$orderby=createdAt desc`)
      .then((r) => setReviews(r.value));

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Skeleton width={120} height={40} sx={{ mb: 3 }} />
        <Paper sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rounded" height={350} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Skeleton width="60%" height={48} />
              <Skeleton width="30%" height={32} sx={{ mt: 1 }} />
              <Skeleton width="100%" height={120} sx={{ mt: 3 }} />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography color="error">{t("error")}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Button
        component={Link}
        to="/books"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, color: "text.secondary" }}
      >
        {t("backToBooks")}
      </Button>

      <Paper sx={{ p: { xs: 3, md: 5 }, border: 1, borderColor: "divider" }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                height: 380,
                background: gradientFor(book.title),
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 800, fontSize: "6rem" }}>
                {book.title.charAt(0)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
              {book.title}
            </Typography>

            <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ mb: 2 }}>
              {book.author?.name || book.authorName}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Rating value={book.rating} precision={0.1} readOnly sx={{ color: "secondary.main" }} />
              {book.rating > 0 ? (
                <Typography variant="body1" fontWeight={600}>
                  ({book.rating})
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t("noRatings")}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
              {book.genres?.map((bg) => (
                <Chip
                  key={bg.ID}
                  label={bg.genre?.name}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                    fontWeight: 600,
                  }}
                />
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body1" sx={{ lineHeight: 1.8, color: "text.secondary", mb: 3 }}>
              {book.description}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
                  {t("price")}
                </Typography>
                <Typography variant="h5" color="primary.main" fontWeight={800}>
                  ${book.price}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
                  {t("inStock")}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={book.stock > 0 ? `${book.stock} ${t("inStock")}` : t("outOfStock")}
                    color={book.stock > 0 ? "success" : "error"}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
                  {t("isbn")}
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {book.isbn}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
                  {t("publishedDate")}
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {book.publishedDate}
                </Typography>
              </Grid>
            </Grid>

            {book.publisher && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t("publisher")}: <strong>{book.publisher.name}</strong>
              </Typography>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              disabled={book.stock < 1}
              onClick={() => addToCart(book)}
              sx={{ px: 4 }}
            >
              {t("addToCart")}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {recommendations.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
            {t("youMightAlsoLike")}
          </Typography>
          <Box
            sx={{
              position: "relative",
              px: { xs: 0, sm: 6 },
              "& .swiper-button-prev, & .swiper-button-next": {
                color: theme.palette.primary.main,
                width: 40,
                height: 40,
                top: "50%",
                marginTop: 0,
                transform: "translateY(-50%)",
              },
              "& .swiper-button-prev": { left: 0 },
              "& .swiper-button-next": { right: 0 },
              "& .swiper-button-prev::after, & .swiper-button-next::after": {
                fontSize: 18,
                fontWeight: 700,
              },
              "& .swiper-button-disabled": { opacity: 0.3 },
              "& .swiper-pagination-bullet-active": {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          >
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                600: { slidesPerView: 2 },
                900: { slidesPerView: 3 },
                1200: { slidesPerView: 4 },
              }}
              style={{ paddingBottom: 40 }}
            >
              {recommendations.map((rec) => (
                <SwiperSlide key={rec.ID} style={{ height: "auto" }}>
                  <RecommendationCard book={rec} />
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
          {t("reviews")} {reviews.length > 0 && <Typography component="span" variant="h5" color="text.secondary" fontWeight={500}>({reviews.length})</Typography>}
        </Typography>

        {isAuthenticated && user ? (
          <ReviewForm
            bookId={book.ID}
            reviewerName={user.name}
            onSubmitted={reload}
          />
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography color="text.secondary">{t("signInToReview")}</Typography>
            <Button component={Link} to="/login" variant="outlined" size="small">
              {t("signIn")}
            </Button>
          </Paper>
        )}

        <Box sx={{ mt: 4 }}>
          {reviews.length === 0 ? (
            <Typography color="text.secondary">{t("noReviews")}</Typography>
          ) : (
            <Stack spacing={2}>
              {reviews.map((rev) => (
                <ReviewItem key={rev.ID} review={rev} />
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Container>
  );
}

function RecommendationCard({ book }: { book: Book }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: alpha(theme.palette.primary.main, 0.3),
          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
        },
      }}
    >
      <Box
        sx={{
          height: 140,
          background: gradientFor(book.title),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 800, fontSize: "3rem" }}>
          {book.title.charAt(0)}
        </Typography>
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
          {book.authorName || book.author?.name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <Rating value={book.rating} precision={0.1} size="small" readOnly sx={{ color: "secondary.main" }} />
        </Box>
        <Typography variant="h6" color="primary.main" fontWeight={800}>
          ${book.price}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, justifyContent: "space-between" }}>
        <Button
          component={Link}
          to="/books/$bookId"
          params={{ bookId: book.ID }}
          size="small"
        >
          {t("viewDetails")}
        </Button>
        <IconButton
          color="primary"
          disabled={book.stock < 1}
          onClick={() => addToCart(book)}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
            "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
          }}
          size="small"
        >
          <AddShoppingCartIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const theme = useTheme();
  const initial = review.reviewer?.charAt(0).toUpperCase() ?? "?";
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main", fontWeight: 700 }}>
          {initial}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {review.reviewer}
            </Typography>
            <Rating value={review.rating} precision={0.5} size="small" readOnly sx={{ color: "secondary.main" }} />
            {review.createdAt && (
              <Typography variant="caption" color="text.secondary">
                {new Date(review.createdAt).toLocaleDateString()}
              </Typography>
            )}
          </Box>
          {review.title && (
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5 }}>
              {review.title}
            </Typography>
          )}
          {review.comment && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.7 }}>
              {review.comment}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

interface ReviewFormProps {
  bookId: string;
  reviewerName: string;
  onSubmitted: () => void;
}

function ReviewForm({ bookId, reviewerName, onSubmitted }: ReviewFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number | null>(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = rating != null && rating > 0 && !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await catalogApi.addReview({
        book_ID: bookId,
        reviewer: reviewerName,
        rating: rating!,
        title: title.trim(),
        comment: comment.trim(),
      });
      setTitle("");
      setComment("");
      setRating(5);
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        {t("writeReview")}
      </Typography>
      <Box component="form" onSubmit={submit}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "block", mb: 0.5 }}>
              {t("yourRating")}
            </Typography>
            <Rating
              value={rating}
              precision={0.5}
              onChange={(_, v) => setRating(v)}
              sx={{ color: "secondary.main" }}
            />
          </Box>
          <TextField
            label={t("reviewTitle")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label={t("yourComment")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Box>
            <Button type="submit" variant="contained" disabled={!canSubmit}>
              {t("submitReview")}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
