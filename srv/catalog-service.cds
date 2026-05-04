using {bookshop as db} from '../db/schema';

@path: '/api/catalog'
service CatalogService {

  @readonly
  entity Books as projection on db.Books {
    *,
    author.name as authorName : String
  } excluding { createdBy, modifiedBy };

  @readonly
  entity Authors as projection on db.Authors
    excluding { createdBy, modifiedBy };

  @readonly
  entity Genres as projection on db.Genres;

  @readonly
  entity Publishers as projection on db.Publishers
    excluding { createdBy, modifiedBy };

  entity Orders as projection on db.Orders;
  entity OrderItems as projection on db.OrderItems;

  entity Reviews as projection on db.Reviews;

  action submitOrder(orderID : UUID) returns Orders;
}
