import enum


class SystemRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class EventType(str, enum.Enum):
    TRAVEL = "TRAVEL"
    DINING = "DINING"
    HANGOUT = "HANGOUT"
    ENTERTAINMENT = "ENTERTAINMENT"
    SIGHTSEEING = "SIGHTSEEING"
    CUSTOM = "CUSTOM"

class EventScope(str, enum.Enum):
    DAY_HANGOUT = "DAY_HANGOUT"
    VACATION = "VACATION"

class BudgetTier(str, enum.Enum):
    BUDGET = "BUDGET"
    MODERATE = "MODERATE"
    LUXURY = "LUXURY"

class TimeSlot(str, enum.Enum):
    MORNING = "MORNING"
    AFTERNOON = "AFTERNOON"
    EVENING = "EVENING"

class EventRole(str, enum.Enum):
    HOST = "HOST"
    OWNER = "HOST"
    MEMBER = "MEMBER"
    VIEWER = "VIEWER"

class PlanStatus(str, enum.Enum):
    INITIAL = "INITIAL"
    DRAFT = "DRAFT"
    VOTING = "VOTING"
    FINALIZED = "FINALIZED"
    CONFIRMED = "CONFIRMED"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"

class StopStatus(str, enum.Enum):
    INITIAL_PROPOSED = "INITIAL_PROPOSED"
    VOTING_OPEN = "VOTING_OPEN"
    SELECTED_AFTER_VOTE = "SELECTED_AFTER_VOTE"
    REJECTED_IN_VOTE = "REJECTED_IN_VOTE"
    FINALIZED_LOCKED = "FINALIZED_LOCKED"
    ONGOING_ACTIVE = "ONGOING_ACTIVE"
    ADAPTED_ON_TRIP = "ADAPTED_ON_TRIP"
    SKIPPED_ON_TRIP = "SKIPPED_ON_TRIP"
    COMPLETED = "COMPLETED"

class TransportMode(str, enum.Enum):
    WALKING = "WALKING"
    MOTORBIKE = "MOTORBIKE"
    TAXI_GRAB = "TAXI_GRAB"
    CAR = "CAR"
    BUS = "BUS"
    TRAIN = "TRAIN"
    FLIGHT = "FLIGHT"
    BOAT = "BOAT"
    OTHER = "OTHER"

class AuthProvider(str, enum.Enum):
    LOCAL = "LOCAL"
    GOOGLE = "GOOGLE"
    FACEBOOK = "FACEBOOK"

class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"

class StopCategory(str, enum.Enum):
    ATTRACTION = "ATTRACTION"
    RESTAURANT = "RESTAURANT"
    CAFE = "CAFE"
    HOTEL = "HOTEL"
    ENTERTAINMENT = "ENTERTAINMENT"
    TRANSPORT = "TRANSPORT"
    SHOPPING = "SHOPPING"
    OTHER = "OTHER"

class VoteValue(str, enum.Enum):
    UP = "UP"
    DOWN = "DOWN"
    NEUTRAL = "NEUTRAL"

class InvitationStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    EXPIRED = "EXPIRED"

class ChatRole(str, enum.Enum):
    USER = "USER"
    AI = "AI"
    SYSTEM = "SYSTEM"
    ASSISTANT = "AI"