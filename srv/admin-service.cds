using {bookshop as db} from '../db/schema';

@path: '/api/admin'
@requires: 'admin'
service AdminService {

  entity Books as projection on db.Books;
  entity Authors as projection on db.Authors;
  entity Genres as projection on db.Genres;
  entity Publishers as projection on db.Publishers;
  entity Orders as projection on db.Orders;
  entity OrderItems as projection on db.OrderItems;

  action confirmOrder(orderID : UUID) returns Orders;
  action shipOrder(orderID : UUID)    returns Orders;
  action cancelOrder(orderID : UUID)  returns Orders;
}
