class Request < ActiveRecord::Base

  scope :topical, -> { where("created_at > ?", Time.now - 10.minutes) }
  scope :not_satisfied, -> { where(satisfied: false) }

end
