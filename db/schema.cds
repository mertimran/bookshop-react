namespace bookshop;

using {
  cuid,
  managed,
  Currency,
  sap.common.CodeList
} from '@sap/cds/common';

entity Books : cuid, managed {
  title         : localized String(255) @mandatory;
  description   : localized String(2000);
  isbn          : String(13) @mandatory;
  price         : Decimal(10, 2);
  currency      : Currency;
  stock         : Integer default 0;
  publishedDate : Date;
  coverImageUrl : String(500);
  rating        : Decimal(2, 1);
  author        : Association to Authors;
  publisher     : Association to Publishers;
  genres        : Composition of many Books.Genres on genres.book = $self;
  reviews       : Association to many Reviews on reviews.book = $self;
}

entity Books.Genres : cuid {
  book  : Association to Books;
  genre : Association to Genres;
}

entity Authors : cuid, managed {
  name        : String(255) @mandatory;
  biography   : localized String(2000);
  dateOfBirth : Date;
  books       : Association to many Books on books.author = $self;
}

entity Genres : CodeList {
  key ID   : Integer;
  parent   : Association to Genres;
  children : Composition of many Genres on children.parent = $self;
}

entity Publishers : cuid, managed {
  name    : String(255) @mandatory;
  address : String(500);
  website : String(255);
  books   : Association to many Books on books.publisher = $self;
}

entity Orders : cuid, managed {
  orderNo      : String(20);
  orderDate    : DateTime default $now;
  status       : String enum { draft; submitted; confirmed; shipped; delivered; cancelled } default 'draft';
  totalAmount  : Decimal(12, 2);
  currency     : Currency;
  items        : Composition of many OrderItems on items.parent = $self;
  statusEvents : Composition of many OrderStatusEvents on statusEvents.order = $self;
  shipment     : Composition of one Shipments on shipment.order = $self;
}

entity OrderStatusEvents : cuid {
  order  : Association to Orders;
  status : String enum { draft; submitted; confirmed; shipped; delivered; cancelled };
  at     : DateTime;
}

entity Shipments : cuid, managed {
  order        : Association to Orders;
  originName   : String(120);
  originLat    : Decimal(9, 6);
  originLng    : Decimal(9, 6);
  destName     : String(200);
  destLat      : Decimal(9, 6);
  destLng      : Decimal(9, 6);
  // JSON-encoded array of [lng, lat] pairs forming the road route polyline.
  routeGeojson : LargeString;
  shippedAt    : DateTime;
  etaMinutes   : Integer;
  deliveredAt  : DateTime;
}

entity OrderItems : cuid {
  parent    : Association to Orders;
  book      : Association to Books;
  quantity  : Integer @mandatory;
  unitPrice : Decimal(10, 2);
  amount    : Decimal(12, 2);
}

entity Reviews : cuid, managed {
  book      : Association to Books;
  reviewer  : String(255) @mandatory;
  rating    : Decimal(2, 1) @mandatory;
  title     : String(255);
  comment   : String(2000);
}
