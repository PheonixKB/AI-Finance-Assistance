from pydantic import BaseModel
from datetime import date

class InvestmentCreate(BaseModel):
    investment_type: str
    name: str
    quantity: float
    purchase_price: float
    current_price: float | None = None
    purchase_date: date | None = None

class InvestmentUpdate(BaseModel):
    investment_type: str | None = None
    name: str | None = None
    quantity: float | None = None
    purchase_price: float | None = None
    current_price: float | None = None
    purchase_date: date | None = None

class AccountCreate(BaseModel):
    account_name: str
    bank_name: str
    account_number: str
    bank_number: str
    account_type: str
    balance: float = 0.0

class AccountUpdate(BaseModel):
    account_name: str | None = None
    bank_name: str | None = None
    account_number: str | None = None
    bank_number: str | None = None
    account_type: str | None = None
    balance: float | None = None

class SummaryFinanceUpdate(BaseModel):
    credit_score: int | None = None
    epf_balance: int | None = None

class TransactionCreate(BaseModel):
    account_id: int
    date: str # YYYY-MM-DD
    descr: str
    amount: float

class TransactionUpdate(BaseModel):
    date: str | None = None
    descr: str | None = None
    amount: float | None = None